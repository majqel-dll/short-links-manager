import {
    SignUpDto,
    SignInDto,
    PasswordChangeDto,
    RefreshTokenDto,
    CreateUserByPanelDto,
} from "@libs/dtos";
import { ActiveUserPayload, RefreshTokenPayload, SignInResponse } from "@libs/types";
import { UserEntity, SessionEntity, RoleEntity } from "@libs/entities";
import {
    ActivationSourceEnum,
    LogTypeEnum,
    PasswordResetEnum,
    PermissionEnum,
    RoleEnum,
} from "@libs/enums";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { randomUUID as uuidv4 } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
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
import { V1CodeService } from "../code";

@Injectable()
export class V1AuthService {
    constructor(
        @InjectRepository(SessionEntity)
        private readonly sessionRepository: Repository<SessionEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectLogger(V1AuthService)
        private readonly logger: Logger,
        private readonly codeService: V1CodeService,
        private readonly jwtService: JwtService,
    ) {}

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

            await this.codeService.sendVerificationCodeToEmail({ id: user.id }, email);
            void this.logger.log(`New account with id ${user.id} has been created.`, {
                startTime,
                tag: LogTypeEnum.CREATED,
            });

            return user;
        } catch (error) {
            if (typeof error === `object` && `code` in error && error?.code === "23505") {
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
                ...new Set(
                    ...user.permissions.map(({ value }) => value),
                    ...user.roles.flatMap(({ permissions }) =>
                        permissions.map(({ value }) => value),
                    ),
                ),
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
            .catch((error) => {
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
            .catch((error) => {
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
            .catch((error) => {
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
            .catch((error) => {
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
            .catch((error) => {
                this.logger.error(`Failed to encrypt new password.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.INTERNAL_ACTION_FAIL,
                });
                throw new InternalServerErrorException(`Failed to update password.`);
            });

        await this.userRepository
            .update({ id: existingUser.id }, { passwordHash })
            .catch((error) => {
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
        });

        if (!user) {
            throw new NotFoundException(`User with such login or email not found.`);
        }

        if (user.blockedAt !== null) {
            throw new ForbiddenException(`This account is banned.`);
        }

        void this.logger.log(
            `Password reset code for user ${user.id} has been requested.`,
            {
                startTime,
                tag: LogTypeEnum.INTERNAL_ACTION,
            },
        );
    }

    public async refreshToken({ refreshToken }: RefreshTokenDto): Promise<SignInResponse> {
        const startTime: number = Date.now();
        const payload: RefreshTokenPayload = await this.jwtService
            .verifyAsync(refreshToken)
            .catch((error) => {
                this.logger.error(`Failed to read passed key.`, {
                    startTime,
                    error,
                    tag: LogTypeEnum.AUTHORIZATION_FAIL,
                });
                throw new ForbiddenException();
            });

        if (!payload?.sessionUuid || !payload.loginAttemptUuid) {
            throw new BadRequestException(`Incorrect token.`);
        }

        const { sessionUuid, loginAttemptUuid } = payload;
        const session = await this.sessionRepository.findOne({
            where: { loginAttemptUuid, isActive: true },
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
                sessionUuid: session.sessionUuid,
                id: user.id,
            });

            throw new ForbiddenException();
        }

        if (!session.isKeyFresh()) {
            this.sessionRepository.update({ id: session.id }, { isActive: false });
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
                { sessionUuid: newSessionUuid, expiresAt: refreshTokenExpiringDate },
            )
            .catch((error) => {
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
            .catch((error) => {
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
                ...new Set(
                    ...user.permissions.map(({ value }) => value),
                    ...user.roles.flatMap(({ permissions }) =>
                        permissions.map(({ value }) => value),
                    ),
                ),
            ] as PermissionEnum[],
        };

        const newToken = await this.jwtService
            .signAsync(tokenPayload, {
                secret: process.env.SECRET,
                expiresIn: tokenExpiresIn,
            })
            .catch((error) => {
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
