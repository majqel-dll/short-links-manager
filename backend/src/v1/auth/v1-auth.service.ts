import { ActiveUserPayload, RefreshTokenPayload } from "@libs/types";
import { UserEntity, SessionEntity } from "@libs/entities";
import { InternalServerErrorException, UnauthorizedException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SignUpDto, SignInDto } from "@libs/dtos";
import { InjectLogger } from "@libs/decorators";
import { randomUUID as uuidv4 } from "crypto";
import { LogTypeEnum } from "@libs/enums";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import argon2 from "argon2";

@Injectable()
export class V1AuthService {
    constructor(
        @InjectRepository(SessionEntity)
        private readonly sessionRepository: Repository<SessionEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(V1AuthService)
        private readonly logger: Logger,
        private readonly jwtService: JwtService,
    ) {}

    public async createNewAccount({ login, email, password }: SignUpDto): Promise<void> {
        const startTime = Date.now();
        const existingUser = await this.userRepository.findOne({ where: [{ login }, { email }] });
        if (existingUser) {
            throw new ConflictException(`User with such login or email already exists.`);
        }

        try {
            const passwordHash = await argon2.hash(password, { type: argon2.argon2id, timeCost: 3, memoryCost: 2 ** 16 });
            const newUser = this.userRepository.create({ email, login, passwordHash });
            await this.userRepository.save(newUser);
        } catch (error) {
            if (error?.code === "23505") {
                throw new ConflictException(`User with such login or email already exists.`);
            }

            void this.logger.error(`Failed to create new account.`, {
                startTime,
                tag: LogTypeEnum.CREATE_FAIL,
                error,
            });

            throw new InternalServerErrorException(`Failed to create new account due to an unexpected error.`);
        }
    }

    public async generateRefreshAndAccessToken({ login, password }: SignInDto): Promise<unknown> {
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

        if (user.activatedAt === null) {
            throw new UnauthorizedException(`Account is not activated. Please wait for administrator activation.`);
        }

        if (user.blockedAt !== null) {
            throw new UnauthorizedException(`Account is blocked. Please contact support for more information.`);
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
                    ...user.roles.flatMap(({ permissions }) => permissions.map(({ value }) => value)),
                ),
            ],
        };

        const refreshTokenExpirationDate: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
        const refreshTokenPayload: RefreshTokenPayload = {
            expiringAt: refreshTokenExpirationDate.toISOString(),
            sessionUuid,
            createdAt: new Date().toISOString(),
            userId: user.id,
        };

        const session = this.sessionRepository.create({
            userId: user.id,
            expiresAt: refreshTokenExpirationDate,
            sessionId: sessionUuid,
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
}
