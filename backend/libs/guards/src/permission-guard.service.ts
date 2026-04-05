import { InjectLogger } from "@libs/decorators";
import { UserEntity } from "@libs/entities";
import { LogTypeEnum, MetadataKeyEnum, PermissionEnum } from "@libs/enums";
import { Logger } from "@libs/logger";
import { ActiveUserPayload } from "@libs/types";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { log } from "console";
import { Repository } from "typeorm";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(PermissionGuard) private readonly logger: Logger,
        private readonly reflector: Reflector,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const startTime: number = Date.now();
        try {
            const requiredPermissions = this.reflector.get<PermissionEnum[]>(
                MetadataKeyEnum.PERMISSION,
                context.getHandler(),
            );

            if (
                !requiredPermissions ||
                requiredPermissions.length === 0 ||
                process.env.NODE_ENV === `DEVELOPMENT`
            ) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const user: ActiveUserPayload = request[MetadataKeyEnum.USER_KEY];

            const loggerPayload = {
                userId: user.id ?? null,
                startTime,
                tag: LogTypeEnum.PERMISSIONS_DENIED,
            };

            if (!user) {
                this.logger.warn(
                    `Unauthenticated user attempted to access a resource requiring permissions.`,
                    loggerPayload,
                );
                return false;
            }

            const userWithRoles = await this.userRepository.findOne({
                where: { id: user.id },
                relations: {
                    roles: { permissions: true },
                    permissions: true,
                    sessions: true,
                },
            });

            if (!userWithRoles) {
                this.logger.warn(
                    `User with specified key not found during permission validation.`,
                    loggerPayload,
                );
                return false;
            }

            if (userWithRoles.activatedAt === null) {
                this.logger.warn(
                    `Non-activated user attempted to access a resource requiring permissions.`,
                    loggerPayload,
                );
                return false;
            }

            if (userWithRoles.blockedAt !== null) {
                this.logger.warn(
                    `Blocked user attempted to access a resource requiring permissions.`,
                    loggerPayload,
                );
                return false;
            }

            const userPermissions = new Set<PermissionEnum>();
            for (const role of userWithRoles.roles) {
                role.permissions.forEach(({ value }) =>
                    userPermissions.add(value as PermissionEnum),
                );
            }

            for (const permission of userWithRoles.permissions) {
                userPermissions.add(permission.value as PermissionEnum);
            }

            return requiredPermissions.every((requiredPermission) =>
                userPermissions.has(requiredPermission),
            );
        } catch (error) {
            if (error instanceof Error || typeof error === `string`) {
                void this.logger.error(
                    `An error occured during permission validatin attempt.`,
                    {
                        error,
                        startTime,
                        tag: LogTypeEnum.VALIDATION_FAIL,
                    },
                );
            }

            return false;
        }
    }
}
