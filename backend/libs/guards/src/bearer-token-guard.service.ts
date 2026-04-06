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
    ) { }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const startTime: number = Date.now();
        const request: Request = context.switchToHttp().getRequest();
        const authHeader = request.headers[`authorization`];
        const message = onAuthRejectionMessage(AuthTypeEnum.BEARER, request);

        if (!authHeader) {
            throw new UnauthorizedException(`Authorization header missing.`);
        }

        const [type, token] = authHeader.split(` `);
        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException(`Invalid authorization format.`);
        }

        const payload: ActiveUserPayload = await this.jwtService
            .verifyAsync(token)
            .catch((error) => {
                void this.logger.error(
                    `Received incorrect or malformed payload ${message}`,
                    {
                        error,
                        startTime,
                        tag: LogTypeEnum.PERMISSIONS_DENIED,
                    },
                );
                throw new UnauthorizedException(`Invalid authorization format.`);
            });

        if (!(`permissions` in payload) || !(`roles` in payload)) {
            throw new UnauthorizedException(`Refresh token used as access token.`);
        }

        const user = await this.userRepository.findOne({
            where: { id: payload?.id },
        });

        const loggerPayload = {
            userId: user?.id ?? null,
            startTime,
            tag: LogTypeEnum.PERMISSIONS_DENIED,
        };

        loggerPayload.userId = user.id ?? null;
        if (!user) {
            void this.logger.warn(message, loggerPayload);
            throw new UnauthorizedException(`User not found.`);
        }

        if (user.activatedAt === null) {
            void this.logger.warn(message, loggerPayload);
            throw new UnauthorizedException(`User account is not activated.`);
        }

        if (user.blockedAt !== null) {
            void this.logger.warn(message, loggerPayload);
            throw new UnauthorizedException(`User account is blocked.`);
        }

        if (!request[MetadataKeyEnum.USER_KEY]) {
            request[MetadataKeyEnum.USER_KEY] = {
                id: payload.id,
                sessionUuid: payload.sessionUuid,
                createdAt: payload.createdAt,
                roles: payload.roles,
                permissions: payload.permissions,
            } as ActiveUserPayload;
        }

        return true;
    }
}
