import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthTypeEnum, LogTypeEnum, MetadataKeyEnum } from "@libs/enums";
import { onAuthRejectionMessage } from "@libs/utils";
import { InjectRepository } from "@nestjs/typeorm";
import { ActiveUserPayload } from "@libs/types";
import { InjectLogger } from "@libs/decorators";
import { UserEntity } from "@libs/entities";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { Request } from "express";

@Injectable()
export class CookieGuardService implements CanActivate {

    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(CookieGuardService) private readonly logger: Logger,
        private readonly jwtService: JwtService,
    ) { }

    public async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {

        const startTime: number = Date.now();
        const request: Request = context.switchToHttp().getRequest();
        const message = onAuthRejectionMessage(AuthTypeEnum.BEARER, request);

        const token = request.cookies?.[`accessToken`];
        if (!token) {
            this.logger.warn(message);
            throw new UnauthorizedException(`Invalid authorization format.`);
        };

        const payload = await this.jwtService.verifyAsync(token).catch(error => {
            this.logger.error(`Received incorrect or malformed payload ${message}`,
                { error, startTime, tag: LogTypeEnum.PERMISSIONS_DENIED })
            throw new UnauthorizedException(`Invalid authorization format.`);
        });

        const user = await this.userRepository.findOne({
            where: { id: payload?.id, uuid: payload?.userUuid },
            relations: { permissions: true, roles: { permissions: true }, sessions: true },
        });

        if (!user) {
            this.logger.warn(message);
            throw new UnauthorizedException(`User not found.`);
        };

        if (user.activatedAt === null) {
            throw new UnauthorizedException(`User account is not activated. ${message}`);
        }

        if (user.blockedAt !== null) {
            throw new UnauthorizedException(`User account is blocked. ${message}`);
        }

        if (!request[MetadataKeyEnum.USER_KEY]) {
            request[MetadataKeyEnum.USER_KEY] = {
                id: user.id,
                sessionUuid: payload.sessionUuid,
                createdAt: payload.createdAt,
                roles: user.roles.map(role => role.name),
                permissions: [
                    ...user.permissions.map(p => p.value),
                    ...user.roles.flatMap(role => role.permissions.map(p => p.value)),
                ],
            } as ActiveUserPayload;
        }

        return true;
    }
}