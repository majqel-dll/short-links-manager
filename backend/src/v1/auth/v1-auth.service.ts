import { ActiveUserPayload, RefreshTokenPayload, SignInResponse } from "@libs/types";
import { UserEntity, SessionEntity, RoleEntity, CodeEntity } from "@libs/entities";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { InjectLogger } from "@libs/decorators";
import { randomUUID as uuidv4 } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { V1CodeService } from "../code";
import { Logger } from "@libs/logger";
import { Request } from "express";
import argon2 from "argon2";
import {
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
    Injectable,
} from "@nestjs/common";
import {
    CreateUserByPanelDto,
    PasswordChangeDto,
    ResetPasswordDto,
    SignUpDto,
    SignInDto,
} from "@libs/dtos";
import {
    ActivationSourceEnum,
    CodeActionEnum,
    PermissionEnum,
    LogTypeEnum,
    RoleEnum,
} from "@libs/enums";

@Injectable()
export class V1AuthService {
    constructor(
        @InjectRepository(SessionEntity)
        private readonly sessionRepository: Repository<SessionEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(CodeEntity)
        private readonly codeRepository: Repository<CodeEntity>,
        @InjectLogger(V1AuthService)
        private readonly logger: Logger,
        private readonly codeService: V1CodeService,
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
    ) { }

    public async createNewAccount(
        { login, email, password }: SignUpDto | CreateUserByPanelDto,
        source: ActivationSourceEnum = ActivationSourceEnum.SIGN_UP,
    ): Promise<UserEntity> {
        const startTime = Date.now();
        const existingUser = await this.userRepository.findOne({
            where: [{ login }, { email }],
        });

        if (existingUser) {
            throw new ConflictException(`User with such login or email already exists.`);
        }

        try {
            if (!password) {
                password = uuidv4();
            }
            const passwordHash = await argon2.hash(password, {
                type: argon2.argon2id,
                timeCost: 3,
                memoryCost: 2 ** 16,
            });

            const roles = await this.roleRepository.findBy({
                assignedEnum: RoleEnum.GUEST,
            });

            const newUser = this.userRepository.create({
                email,
                login,
                roles,
                passwordHash,
                activatedAt: process.env.SMTP_HOST ? null : new Date(),
            });

            if (source === ActivationSourceEnum.PANEL) {
                newUser.activationSource = ActivationSourceEnum.PANEL;
                newUser.requiresPasswordChange = true;
            }

            const user = await this.userRepository.save(newUser);

            await this.codeService.sendVerificationCodeToEmail(
                { id: user.id },
                CodeActionEnum.VERIFY_EMAIL,
                email,
            );
            void this.logger.log(`New account with id ${user.id} has been created.`, {
                startTime,
                tag: LogTypeEnum.CREATED,
            });

            return user;
        } catch (error: unknown) {
            const pgCode =
                typeof error === `object` && error !== null && `code` in error
                    ? (error as { code?: unknown }).code
                    : null;
            if (pgCode === "23505") {
                throw new ConflictException(
                    `User with such login or email already exists.`,
                );
            }

            void this.logger.error(`Failed to create new account.`, {
                startTime,
                tag: LogTypeEnum.CREATE_FAIL,
                error: error as Error,
            });

            throw new InternalServerErrorException(
                `Failed to create new account due to an unexpected error.`,
            );
        }
    }

    public async generateRefreshAndAccessToken({
        login,
        password,
    }: SignInDto): Promise<SignInResponse> {
        const user = await this.userRepository.findOne({
            where: [{ login }, { email: login }],
            relations: { permissions: true, roles: { permissions: true } },
        });

        if (!user) {
            throw new UnauthorizedException(`Invalid login or password.`);
        }

        const isPasswordCorrect = await argon2.verify(user.passwordHash, password);
        if (!isPasswordCorrect) {
            throw new UnauthorizedException(`Invalid login or password.`);
        }

        if (user.blockedAt !== null) {
            throw new UnauthorizedException(
                `Account is blocked. Please contact support for more information.`,
            );
        }

        const sessionUuid = uuidv4();
        const tokenPayload: ActiveUserPayload = {
            id: user.id,
            sessionUuid,
            createdAt: new Date().toISOString(),
            roles: user.roles.map(({ name }) => name),
            permissions: [
                ...new Set([
                    ...user.permissions.map(({ value }) => value),
                    ...user.roles.flatMap(({ permissions }) =>
                        permissions.map(({ value }) => value),
                    ),
                ]),
            ] as PermissionEnum[],
        };

        const refreshTokenExpirationDate: Date = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7,
        );

        const refreshTokenPayload: RefreshTokenPayload = {
            expiringAt: refreshTokenExpirationDate.toISOString(),
            createdAt: new Date().toISOString(),
            loginAttemptUuid: uuidv4(),
            sessionUuid,
            userId: user.id,
        };

        const session = this.sessionRepository.create({
            expiresAt: refreshTokenExpirationDate,
            loginAttemptUuid: refreshTokenPayload.loginAttemptUuid,
            sessionUuid,
            userId: user.id,
        });

        const tokenExpiresIn = `15m`;
        const refreshTokenExpiresIn = `7d`;

        await this.sessionRepository.save(session);
        const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
            secret: process.env.SECRET,
            expiresIn: refreshTokenExpiresIn,
        });

        const accessToken = await this.jwtService.signAsync(tokenPayload, {
            secret: process.env.SECRET,
            expiresIn: tokenExpiresIn,
        });

        void this.userRepository
            .update({ id: user.id }, { lastLoginAt: new Date() })
            .catch((error: Error) => {
                void this.logger.error(
                    `Failed to update last login date for user ${user.id}.`,
                    { startTime: Date.now(), tag: LogTypeEnum.INTERNAL_ACTION_FAIL, error },
                );
            });

        return {
            accessToken: {
                value: accessToken,
                expiresIn: tokenExpiresIn,
            },
            refreshToken: {
                value: refreshToken,
                expiresIn: refreshTokenExpiresIn,
            },
        };
    }

    public async signOut({
        id,
        sessionUuid,
    }: Pick<ActiveUserPayload, "id" | "sessionUuid">): Promise<void> {
        const startTime = Date.now();
        const updateResult = await this.sessionRepository
            .update({ userId: id, sessionUuid }, { isActive: false })
            .catch((error: Error) => {
                void this.logger.error(
                    `Failed to terminate session ${sessionUuid} for user ${id}.`,
                    { startTime, tag: LogTypeEnum.INTERNAL_ACTION_FAIL, error },
                );
                throw new InternalServerErrorException(
                    `Failed to terminate session due to an unexpected error.`,
                );
            });

        if (updateResult.affected === 0) {
            throw new NotFoundException(
                `Session ${sessionUuid} for current user not found.`,
            );
        }

        void this.logger.log(`Session ${sessionUuid} for user ${id} has been terminated.`, {
            startTime,
            tag: LogTypeEnum.INTERNAL_ACTION,
        });
    }

    public async terminateAllSessionsForUser({ id }: ActiveUserPayload): Promise<void> {
        const startTime: number = Date.now();
        await this.sessionRepository
            .update({ userId: id, isActive: true }, { isActive: false })
            .catch((error: Error) => {
                void this.logger.error(`Failed to terminate sessions for user ${id}.`, {
                    startTime,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                    error,
                });
                throw new InternalServerErrorException(
                    `Failed to terminate sessions due to an unexpected error.`,
                );
            });

        void this.logger.log(`All sessions for user ${id} have been terminated.`, {
            startTime,
            tag: LogTypeEnum.INTERNAL_ACTION,
        });
    }

    public async findActiveSessionForUser(userId: number): Promise<SessionEntity[]> {
        const activeSessions = await this.sessionRepository
            .find({ where: { userId, isActive: true } })
            .catch((error: Error) => {
                void this.logger.error(
                    `Failed to find active sessions for user ${userId}.`,
                    { startTime: Date.now(), tag: LogTypeEnum.INTERNAL_ACTION_FAIL, error },
                );
                throw new InternalServerErrorException(
                    `Failed to find active sessions due to an unexpected error.`,
                );
            });

        void this.logger.log(
            `${activeSessions.length} Active sessions for user ${userId} have been retrieved.`,
            {
                startTime: Date.now(),
                tag: LogTypeEnum.INTERNAL_ACTION,
            },
        );

        return activeSessions;
    }

    public async changePassword(
        user: ActiveUserPayload,
        { newPassword, newPasswordConfirm, oldPassword }: PasswordChangeDto,
    ): Promise<void> {
        const startTime = Date.now();
        const existingUser = await this.userRepository.findOne({
            where: { id: user.id },
        });

        if (newPasswordConfirm !== newPassword) {
            throw new BadRequestException(`Both passwords must match.`);
        }

        if (!existingUser) {
            throw new UnauthorizedException(`Incorrect login or password.`);
        }

        const isPasswordCorrect = await argon2.verify(
            existingUser.passwordHash,
            oldPassword,
        );
        if (!isPasswordCorrect) {
            throw new UnauthorizedException(`Incorrect login or password.`);
        }

        if (existingUser.activatedAt === null) {
            throw new ForbiddenException(`Wait for administrator acceptation.`);
        }

        if (existingUser.blockedAt !== null) {
            throw new ForbiddenException(`This account is banned.`);
        }

        const passwordHash = await argon2
            .hash(newPassword, { type: argon2.argon2id, timeCost: 3, memoryCost: 2 ** 16 })
            .catch((error: Error) => {
                this.logger.error(`Failed to encrypt new password.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                });
                throw new InternalServerErrorException(`Failed to update password.`);
            });

        await this.userRepository
            .update({ id: existingUser.id }, { passwordHash })
            .catch((error: Error) => {
                this.logger.error(`Failed to save new password.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                });
                throw new InternalServerErrorException(`Failed to update password.`);
            });

        await this.sessionRepository.update(
            { userId: existingUser.id, isActive: true },
            { isActive: false },
        );

        this.logger.log(`Successfully changed password for user ${existingUser.id}`, {
            startTime,
            tag: LogTypeEnum.INTERNAL_ACTION,
        });
    }

    public async requestPasswordReset(login: string): Promise<void> {
        const startTime = Date.now();
        const user = await this.userRepository.findOne({
            where: [{ login }, { email: login }],
            select: { id: true },
        });

        if (user?.blockedAt !== null) {
            throw new NotFoundException(`User with such login or email not found.`);
        }

        await this.codeService.sendVerificationCodeToEmail(
            user,
            CodeActionEnum.RESET_PASSWORD_REQUEST,
        );

        void this.logger.log(
            `Password reset code for user ${user.id} has been requested.`,
            { startTime, tag: LogTypeEnum.INTERNAL_ACTION },
        );
    }

    public async changePasswordFromCode({
        code,
        newPassword,
        newPasswordConfirm,
    }: ResetPasswordDto): Promise<void> {
        const startTime = Date.now();
        if (newPassword !== newPasswordConfirm) {
            throw new BadRequestException(`Both passwords must match.`);
        }

        const codeEntity = await this.codeRepository
            .findOne({
                where: { code, action: CodeActionEnum.RESET_PASSWORD_REQUEST },
                relations: { user: true },
            })
            .catch((error: Error) => {
                this.logger.error(
                    `Failed to find code ${code} for activation. Error: ${error.message}`,
                    {
                        startTime,
                        tag: LogTypeEnum.DATABASE_READ_FAIL,
                        error,
                    },
                );
                throw new InternalServerErrorException(
                    `Failed to activate account. Please try again later.`,
                );
            });

        if (!codeEntity) {
            this.logger.warn(`Attempt to change password with invalid code: ${code}`, {
                startTime,
                tag: LogTypeEnum.WARN,
            });
            throw new BadRequestException(`Invalid reset password code.`);
        }

        if (codeEntity.usedAt) {
            this.logger.warn(`Attempt to reuse already used code: ${code}`, {
                startTime,
                tag: LogTypeEnum.WARN,
            });
            throw new BadRequestException(
                `This reset password code has already been used.`,
            );
        }

        if (codeEntity.expiresAt && codeEntity.expiresAt < new Date()) {
            this.logger.warn(`Attempt to use expired code: ${code}`, {
                startTime,
                tag: LogTypeEnum.WARN,
            });
            throw new BadRequestException(`This reset password code has expired.`);
        }

        const user = codeEntity.user;
        if (!user) {
            this.logger.error(
                `Code with id ${codeEntity.id} is not associated with any user.`,
                { startTime, tag: LogTypeEnum.NOT_FOUND },
            );
            throw new InternalServerErrorException(
                `Invalid reset password code. Please request a new one.`,
            );
        }

        const passwordHash = await argon2
            .hash(newPassword, { type: argon2.argon2id, timeCost: 3, memoryCost: 2 ** 16 })
            .catch((error: Error) => {
                this.logger.error(`Failed to encrypt new password.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                });
                throw new InternalServerErrorException(`Failed to update password.`);
            });

        await this.dataSource.transaction(async (manager) => {
            user.passwordHash = passwordHash;
            user.requiresPasswordChange = false;
            user.lastPasswordChange = new Date();
            codeEntity.usedAt = new Date();

            await manager.save(CodeEntity, codeEntity).catch((error: Error) => {
                this.logger.error(`Failed to mark code ${code} as used.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                });
                throw new InternalServerErrorException(
                    `Failed to update reset password code status.`,
                );
            });

            await manager.save(UserEntity, user).catch((error: Error) => {
                this.logger.error(`Failed to save password change in the database.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                });
                throw new InternalServerErrorException(`Failed to update password.`);
            });

            await manager
                .update(
                    SessionEntity,
                    { userId: user.id, isActive: true },
                    { isActive: false },
                )
                .catch((error: Error) => {
                    this.logger.error(
                        `Failed to terminate active sessions after password change.`,
                        {
                            startTime,
                            error,
                            tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                        },
                    );
                    throw new InternalServerErrorException(
                        `Failed to terminate active sessions after password change.`,
                    );
                });
        });

        void this.logger.log(
            `Password for user ${user.id} has been changed from reset code.`,
            { startTime, tag: LogTypeEnum.INTERNAL_ACTION },
        );
    }

    public async refreshToken(request: Request): Promise<SignInResponse> {
        const startTime: number = Date.now();
        const cookies = request.cookies as Record<string, unknown> | undefined;
        const refreshToken =
            typeof cookies?.[`refreshToken`] === `string` ? cookies[`refreshToken`] : null;
        if (!refreshToken) {
            void this.logger.warn(`Failed to read refresh token from cookies.`);
            throw new UnauthorizedException(`Invalid refresh token format or missing token in cookies.`);
        }

        const payload: RefreshTokenPayload = await this.jwtService
            .verifyAsync<RefreshTokenPayload>(refreshToken)
            .catch((error: unknown) => {
                this.logger.error(`Failed to read passed key.`, {
                    startTime,
                    error: error as Error,
                    tag: LogTypeEnum.AUTHORIZATION_FAIL,
                });
                throw new ForbiddenException();
            });

        if (!payload?.sessionUuid) {
            throw new BadRequestException(`Incorrect token.`);
        }

        const { sessionUuid } = payload;
        const session = await this.sessionRepository.findOne({
            where: { sessionUuid, isActive: true },
            relations: { user: { permissions: true, roles: { permissions: true } } },
        });

        if (!session) {
            throw new BadRequestException(`Specified key doesn't exist.`);
        }

        const user = session.user;
        if (user.blockedAt) {
            throw new ForbiddenException(`This account is banned.`);
        }

        if (session.sessionUuid !== sessionUuid) {
            this.logger.warn(`Specified key has been used second time. Killing session.`, {
                startTime,
                tag: LogTypeEnum.PERMISSIONS_FAIL,
            });

            await this.signOut({
                sessionUuid,
                id: user.id,
            });

            throw new ForbiddenException();
        }

        if (!session.isKeyFresh()) {
            await this.sessionRepository.update({ id: session.id }, { isActive: false });
            throw new ForbiddenException(`Specified token has already expired.`);
        }

        const newSessionUuid = uuidv4();
        const refreshTokenExpiringDate: Date = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7,
        );
        const refreshTokenPayload: RefreshTokenPayload = {
            expiringAt: refreshTokenExpiringDate.toISOString(),
            createdAt: new Date().toISOString(),
            loginAttemptUuid: uuidv4(),
            sessionUuid: newSessionUuid,
            userId: user.id,
        };

        await this.sessionRepository
            .update(
                { id: session.id },
                {
                    sessionUuid: newSessionUuid,
                    expiresAt: refreshTokenExpiringDate
                },
            )
            .catch((error: Error) => {
                this.logger.error(`Failed to save new refresh token.`, {
                    error,
                    startTime,
                    tag: LogTypeEnum.AUTHORIZATION_FAIL,
                });
                throw new InternalServerErrorException();
            });

        const tokenExpiresIn = `15m`;
        const refreshTokenExpiresIn = `7d`;

        const newRefreshToken = await this.jwtService
            .signAsync(refreshTokenPayload, {
                secret: process.env.SECRET,
                expiresIn: refreshTokenExpiresIn,
            })
            .catch((error: Error) => {
                this.logger.error(`Failed to sign new refresh token token payload.`, {
                    error,
                    startTime,
                    tag: LogTypeEnum.AUTHORIZATION_FAIL,
                });
                throw new InternalServerErrorException();
            });

        const tokenPayload: ActiveUserPayload = {
            id: user.id,
            sessionUuid: newSessionUuid,
            createdAt: new Date().toISOString(),
            roles: user.roles.map(({ name }) => name),
            permissions: [
                ...new Set([
                    ...user.permissions.map(({ value }) => value),
                    ...user.roles.flatMap(({ permissions }) =>
                        permissions.map(({ value }) => value),
                    ),
                ]),
            ] as PermissionEnum[],
        };

        const newToken = await this.jwtService
            .signAsync(tokenPayload, {
                secret: process.env.SECRET,
                expiresIn: tokenExpiresIn,
            })
            .catch((error: Error) => {
                this.logger.error(`Failed to sign new access token payload.`, {
                    error,
                    startTime,
                    tag: LogTypeEnum.AUTHORIZATION_FAIL,
                });
                throw new InternalServerErrorException();
            });

        return {
            accessToken: {
                value: newToken,
                expiresIn: tokenExpiresIn,
            },
            refreshToken: {
                value: newRefreshToken,
                expiresIn: refreshTokenExpiresIn,
            },
        } as SignInResponse;
    }
}
