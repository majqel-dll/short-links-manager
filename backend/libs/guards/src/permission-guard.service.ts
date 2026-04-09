import {
    LogTypeEnum,
    MetadataKeyEnum,
    PermissionEnum,
    PermissionOnRole,
    RoleEnum,
} from "@libs/enums";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PermissionEntity, RoleEntity, UserEntity } from "@libs/entities";
import { InjectRepository } from "@nestjs/typeorm";
import { ActiveUserPayload } from "@libs/types";
import { InjectLogger } from "@libs/decorators";
import { Reflector } from "@nestjs/core";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(PermissionGuard) private readonly logger: Logger,
        private readonly reflector: Reflector,
    ) {
        void this.synchronizePermissions();
        void this.synchronizeRoles();
    }

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

    private async synchronizePermissions(): Promise<void> {
        const startTime: number = Date.now();
        try {
            const currentPermissions = Object.values(PermissionEnum);
            const savedPermissions = await this.permissionRepository.find();

            const createdPermissions = await this.permissionRepository.save(
                currentPermissions
                    .map((permission) =>
                        !savedPermissions.some(
                            (savedPermission) => savedPermission.value === permission,
                        )
                            ? this.permissionRepository.create({
                                value: permission,
                                assignedEnum: permission,
                            })
                            : null,
                    )
                    .filter(Boolean),
            );

            if (createdPermissions.length > 0) {
                this.logger.log(
                    `Successfully created ${createdPermissions.length} permissions.`,
                    { startTime, tag: LogTypeEnum.CREATED },
                );
            }

            const permissionsToRemove = savedPermissions
                .filter(
                    (savedPermission) =>
                        !currentPermissions.some(
                            (permission) => permission === savedPermission.value,
                        ),
                )
                .map((permission) => permission.id);

            if (permissionsToRemove.length > 0) {
                const removedPermissions =
                    await this.permissionRepository.delete(permissionsToRemove);
                if (removedPermissions.affected > 0) {
                    this.logger.log(
                        `Successfully removed ${removedPermissions.affected} permissions.`,
                        { startTime, tag: LogTypeEnum.DELETED },
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Failed to synchronize permissions from enum in database.`, {
                error: error as Error,
                startTime,
                tag: LogTypeEnum.SYNCHRONIZATION_FAIL,
            });
        }
    }

    private async synchronizeRoles(): Promise<void> {
        const startTime: number = Date.now();
        try {
            const currentRoles = Object.values(RoleEnum);
            const savedRoles = await this.roleRepository.find();

            const createdRoles = await this.roleRepository.save(
                currentRoles
                    .map((role) =>
                        !savedRoles.some((savedRole) => savedRole.name === role)
                            ? this.roleRepository.create({
                                name: role,
                                assignedEnum: role,
                            })
                            : null,
                    )
                    .filter(Boolean),
            );

            if (createdRoles.length > 0) {
                this.logger.log(`Successfully created ${createdRoles.length} roles.`, {
                    startTime,
                    tag: LogTypeEnum.CREATED,
                });
            }

            const rolesToRemove = savedRoles
                .filter(
                    (savedRole) => !currentRoles.some((role) => role === savedRole.name),
                )
                .map((role) => role.id);

            if (rolesToRemove.length > 0) {
                const removedRoles = await this.roleRepository.delete(rolesToRemove);
                if (removedRoles.affected > 0) {
                    this.logger.log(
                        `Successfully removed ${removedRoles.affected} roles.`,
                        { startTime, tag: LogTypeEnum.DELETED },
                    );
                }
            }

            const allPermissions = await this.permissionRepository.find();
            const permissionsMap = new Map<PermissionEnum, PermissionEntity>(
                allPermissions.map((permission) => [permission.assignedEnum, permission]),
            );

            const savedRolesWithPermissions = await this.roleRepository.find({
                relations: { permissions: true },
            });
            const rolesMap = new Map<string, RoleEntity>(
                savedRolesWithPermissions.map((role) => [role.assignedEnum, role]),
            );

            await this.roleRepository.save(
                Object.entries(PermissionOnRole)
                    .map(([roleEnum, permissions]) => {
                        const role = rolesMap.get(roleEnum);
                        if (!role) {
                            return null;
                        }
                        role.permissions = permissions.map((p) => permissionsMap.get(p));
                        return role;
                    })
                    .filter(Boolean),
            );
        } catch (error) {
            this.logger.error(`Failed to synchronize roles from enum in database.`, {
                error: error as Error,
                startTime,
                tag: LogTypeEnum.SYNCHRONIZATION_FAIL,
            });
        }
    }
}
