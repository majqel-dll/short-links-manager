import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthTypeEnum, LogTypeEnum, MetadataKeyEnum } from "@libs/enums";
import { onAuthRejectionMessage } from "@libs/utils";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { ActiveUserPayload } from "@libs/types";
import { UserEntity } from "@libs/entities";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { Request } from "express";

@Injectable()
export class BearerTokenGuardService implements CanActivate {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(BearerTokenGuardService) private readonly logger: Logger,
        private readonly jwtService: JwtService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const startTime: number = Date.now();
        const request: Request = context.switchToHttp().getRequest();
        const authHeader = request.headers[`authorization`];
        const message = onAuthRejectionMessage(AuthTypeEnum.BEARER, request);

        if (!authHeader) {
            throw new UnauthorizedException(`Authorization header missing. ${message}`);
        }

        const [type, token] = authHeader.split(` `);
        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException(`Invalid authorization format. ${message}`);
        }

        try {
            const payload: ActiveUserPayload = await this.jwtService.verifyAsync(token, {
                secret: process.env.SECRET,
            });
            const user = await this.userRepository.findOne({
                where: { id: payload?.id },
                relations: {
                    permissions: true,
                    roles: { permissions: true },
                    sessions: true,
                },
            });

            if (!user) {
                throw new UnauthorizedException(`User not found. ${message}`);
            }

            if (user.activatedAt === null) {
                throw new UnauthorizedException(
                    `User account is not activated. ${message}`,
                );
            }

            if (user.blockedAt !== null) {
                throw new UnauthorizedException(`User account is blocked. ${message}`);
            }

            if (!request[MetadataKeyEnum.USER_KEY]) {
                request[MetadataKeyEnum.USER_KEY] = {
                    id: user.id,
                    sessionUuid: payload.sessionUuid,
                    createdAt: payload.createdAt,
                    roles: user.roles.map((role) => role.name),
                    permissions: [
                        ...user.permissions.map((p) => p.value),
                        ...user.roles.flatMap((role) =>
                            role.permissions.map((p) => p.value),
                        ),
                    ],
                } as ActiveUserPayload;
            }
            return true;
        } catch (error) {
            if (typeof error !== `object` && typeof error !== `string`) {
                return false;
            }

            if (
                typeof error === `object` &&
                `name` in error &&
                error?.name === `TokenExpiredError`
            ) {
                this.logger.error(`Used token has already expired.`, {
                    error,
                    startTime,
                    tag: LogTypeEnum.AUTHORIZATION_FAIL,
                });
            }

            this.logger.error(`Failed to verify specified user properties.`, {
                error,
                startTime,
                tag: LogTypeEnum.AUTHORIZATION_FAIL,
            });

            return false;
        }
    }
}
