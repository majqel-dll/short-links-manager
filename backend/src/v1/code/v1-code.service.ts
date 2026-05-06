import {
    BadRequestException,
    ClassSerializerInterceptor,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UseInterceptors,
} from "@nestjs/common";
import { DataSource, IsNull, MoreThanOrEqual, Or, Repository } from "typeorm";
import { CodeActionEnum } from "@libs/enums/code/code-action.enum";
import { UserEntity, CodeEntity } from "@libs/entities";
import { ThrottlerException } from "@nestjs/throttler";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { ActiveUserPayload } from "@libs/types";
import { EmailerEventsEnum, LogTypeEnum } from "@libs/enums";
import { EmailerService } from "@libs/emailer";
import { randomInt } from "crypto";
@Injectable()
@UseInterceptors(ClassSerializerInterceptor)
export class V1CodeService {
    constructor(
        @InjectRepository(CodeEntity)
        private readonly codeRepository: Repository<CodeEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(V1CodeService)
        private readonly logger: Logger,
        private readonly emailerService: EmailerService,
        private readonly dataSource: DataSource,
    ) {}

    private randomNumber(length = 9): string {
        const maxValue = 10 ** length;
        return randomInt(0, maxValue).toString().padStart(length, "0");
    }

    public async findActiveCodeForUser(
        userId: number,
        action: CodeActionEnum,
    ): Promise<CodeEntity[]> {
        return await this.codeRepository
            .find({
                where: {
                    userId,
                    action,
                    usedAt: null,
                    expiresAt: Or(IsNull(), MoreThanOrEqual(new Date())),
                },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to find active code for user with id ${userId} and action ${action}. Error: ${(error as Error)?.message}`,
                );
                throw new InternalServerErrorException(
                    `Failed to find active code. Please try again later.`,
                );
            });
    }

    public async activateUserWithCode(code: string): Promise<void> {
        const startTime = Date.now();
        const codeEntity = await this.codeRepository
            .findOne({
                where: { code, action: CodeActionEnum.VERIFY_EMAIL },
                relations: { user: true },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to find code ${code} for activation. Error: ${(error as Error)?.message}`,
                    { startTime, tag: LogTypeEnum.RESPONSE_FAIL, error: error as Error },
                );
                throw new InternalServerErrorException(
                    `Failed to activate account. Please try again later.`,
                );
            });

        if (!codeEntity) {
            this.logger.warn(`Attempt to activate account with invalid code: ${code}`, {
                startTime,
                tag: LogTypeEnum.WARN,
            });
            throw new BadRequestException(`Invalid activation code.`);
        }

        if (codeEntity.usedAt) {
            this.logger.warn(`Attempt to reuse already used code: ${code}`, {
                startTime,
                tag: LogTypeEnum.WARN,
            });
            throw new BadRequestException(`This activation code has already been used.`);
        }

        if (codeEntity.expiresAt && codeEntity.expiresAt < new Date()) {
            this.logger.warn(`Attempt to use expired code: ${code}`, {
                startTime,
                tag: LogTypeEnum.WARN,
            });
            throw new BadRequestException(`This activation code has expired.`);
        }

        const user = codeEntity.user;
        if (!user) {
            this.logger.error(
                `Code with id ${codeEntity.id} is not associated with any user.`,
                { startTime, tag: LogTypeEnum.NOT_FOUND },
            );
            throw new InternalServerErrorException(
                `Invalid activation code. Please request a new one.`,
            );
        }

        user.activatedAt = new Date();
        codeEntity.usedAt = new Date();

        await this.dataSource.transaction(async (manager) => {
            await manager.save(UserEntity, user).catch((error) => {
                this.logger.error(
                    `Failed to activate user with id ${user.id} using code ${code}. Error: ${(error as Error)?.message}`,
                    { startTime, tag: LogTypeEnum.UPDATE_FAIL, error: error as Error },
                );
                throw new InternalServerErrorException(
                    `Failed to activate account. Please try again later.`,
                );
            });

            await manager.save(CodeEntity, codeEntity).catch((error) => {
                this.logger.error(
                    `Failed to mark code ${code} as used. Error: ${(error as Error)?.message}`,
                    { startTime, tag: LogTypeEnum.UPDATE_FAIL, error: error as Error },
                );
                throw new InternalServerErrorException(
                    `Failed to activate account. Please try again later.`,
                );
            });
        });
    }

    public async sendVerificationCodeToEmail(
        { id }: Pick<ActiveUserPayload, "id">,
        email?: string,
    ): Promise<boolean> {
        const startTime = Date.now();
        const user = await this.userRepository
            .findOne({
                where: { id },
                relations: { codes: true },
                select: { email: true, activatedAt: true, codes: true, id: true },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to find user with id ${id} while trying to send verification code. Error: ${(error as Error)?.message}`,
                    { startTime, tag: LogTypeEnum.RESPONSE_FAIL, error: error as Error },
                );
                throw new InternalServerErrorException(
                    `Failed to find user with id ${id}. Please try again later.`,
                );
            });

        if (!user) {
            this.logger.error(`User with id ${id} not found.`, {
                startTime,
                tag: LogTypeEnum.NOT_FOUND,
            });
            throw new NotFoundException(`User with id ${id} not found.`);
        }

        if (user.activatedAt) {
            this.logger.warn(
                `User with id ${id} is already activated. No verification code will be sent.`,
                { startTime, tag: LogTypeEnum.WARN },
            );
            return false;
        }

        if (!email) {
            email = user.email;
        }

        const existingCode = user.codes?.find(
            (code) =>
                code.action === CodeActionEnum.VERIFY_EMAIL &&
                (!code.expiresAt || code.expiresAt > new Date()),
        );
        if (existingCode && existingCode.updatedAt > new Date(Date.now() - 3 * 60 * 1000)) {
            this.logger.warn(
                `User with id: ${id} already has an active verification code. No new code will be sent.`,
                { startTime, tag: LogTypeEnum.WARN },
            );
            throw new ThrottlerException(
                `A verification code has already been sent to this email. Please check your inbox or try again later.`,
            );
        }

        const code = existingCode ? existingCode.code : this.randomNumber();

        const expiresAt = existingCode
            ? existingCode.expiresAt
            : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        if (existingCode) {
            existingCode.updatedAt = new Date();
            await this.codeRepository.save(existingCode).catch((error) => {
                this.logger.error(
                    `Failed to update existing verification code for user with id ${id}. Error: ${(error as Error)?.message}`,
                    { startTime, tag: LogTypeEnum.UPDATE_FAIL, error: error as Error },
                );
                throw new InternalServerErrorException(
                    `Failed to update and re-send verification code. Please try again later.`,
                );
            });
        }

        const expiryTime = expiresAt.toISOString();
        const codeEntity =
            existingCode ??
            (await this.codeRepository
                .save(
                    this.codeRepository.create({
                        code,
                        user,
                        expiresAt,
                        updatedAt: new Date(),
                        action: CodeActionEnum.VERIFY_EMAIL,
                    }),
                )
                .catch((error) => {
                    this.logger.error(
                        `Failed to save verification code for user with id ${id}. Error: ${(error as Error)?.message}`,
                        { startTime, tag: LogTypeEnum.CREATE_FAIL, error: error as Error },
                    );
                    throw new InternalServerErrorException(
                        `Failed to save verification code. Please try again later.`,
                    );
                }));

        const link = `${process.env.ORIGIN}/api/v1/code/${codeEntity.code}/confirm`;
        const subject = `Your Verification Code`;
        await this.emailerService.send({
            subject,
            to: email,
            data: { code, email, expiryTime, link },
            event: EmailerEventsEnum.REGISTRATION_CODE,
        });

        return true;
    }
}
