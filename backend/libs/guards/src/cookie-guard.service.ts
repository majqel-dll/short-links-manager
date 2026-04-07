import { AuthTypeEnum, LogTypeEnum, MetadataKeyEnum } from "@libs/enums";
import { SessionEntity, UserEntity } from "@libs/entities";
import { onAuthRejectionMessage } from "@libs/utils";
import { InjectRepository } from "@nestjs/typeorm";
import { ActiveUserPayload } from "@libs/types";
import { InjectLogger } from "@libs/decorators";
import { JwtService } from "@nestjs/jwt";
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { Request } from "express";

@Injectable()
export class CookieGuardService implements CanActivate {
    constructor(
        @InjectRepository(SessionEntity)
        private readonly sessionRepository: Repository<SessionEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(CookieGuardService) private readonly logger: Logger,
        private readonly jwtService: JwtService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const startTime: number = Date.now();
        const request: Request = context.switchToHttp().getRequest();
        const message = onAuthRejectionMessage(AuthTypeEnum.COOKIE, request);

        const loggerPayload = {
            userId: null,
            startTime,
            tag: LogTypeEnum.PERMISSIONS_DENIED,
        };

        const token = request.cookies?.[`accessToken`];
        if (!token) {
            void this.logger.warn(message, loggerPayload);
            throw new UnauthorizedException(`Invalid authorization format.`);
        }

        const payload = await this.jwtService.verifyAsync(token).catch((error) => {
            void this.logger.error(`Received incorrect or malformed payload ${message}`, {
                error,
                startTime,
                tag: LogTypeEnum.PERMISSIONS_DENIED,
            });
            throw new UnauthorizedException(`Invalid authorization format.`);
        });

        if (!(`permissions` in payload) || !(`roles` in payload)) {
            throw new UnauthorizedException(`Refresh token used as access token.`);
        }

        const user = await this.userRepository.findOne({
            where: { id: payload?.id },
        });

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

        const session = await this.sessionRepository.findOne({
            where: {
                sessionUuid: payload.sessionUuid,
                user: { id: payload.id },
            },
        });

        if (!session || !session.isActive || session.expiresAt < new Date()) {
            void this.logger.warn(message, loggerPayload);
            throw new UnauthorizedException(`Session is invalid, inactive, or expired.`);
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
