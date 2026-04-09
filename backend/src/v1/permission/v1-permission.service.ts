import { PermissionEntity, RoleEntity, UserEntity } from "@libs/entities";
import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { ChangeUserPermissionsParams, GetEntitiesResponse, GetEntityResponseMeta } from "@libs/types";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { In, Repository } from "typeorm";
import { Logger } from "@libs/logger";
import {
    ChangeUserPermissionsActionEnum,
    LogTypeEnum,
} from "@libs/enums";
import { BasicSearchQueryParamsDto, ChangeRoleDto } from "@libs/dtos";

@Injectable()
export class V1PermissionService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(V1PermissionService)
        private readonly logger: Logger,
    ) { }

    public async getPermissions({
        take,
        skip,
    }: BasicSearchQueryParamsDto): Promise<GetEntitiesResponse<PermissionEntity>> {
        const [permissions, total] = await this.permissionRepository.findAndCount({ take, skip });
        if (permissions.length === 0) {
            throw new NotFoundException(`No permissions found in the database.`);
        }

        const meta: GetEntityResponseMeta = {
            totalRecords: total,
            currentPage: skip ?? 0,
            pageSize: take ?? total,
            totalPages: take ? Math.ceil(total / take) : 1,
        }

        return { data: permissions, meta };

    }

    public async getRoles({
        take,
        skip,
    }: BasicSearchQueryParamsDto): Promise<GetEntitiesResponse<RoleEntity>> {
        const [roles, total] = await this.roleRepository.findAndCount({ take, skip });
        if (roles.length === 0) {
            throw new NotFoundException(`No roles found in the database.`);
        }

        const meta: GetEntityResponseMeta = {
            totalRecords: total,
            currentPage: skip ?? 0,
            pageSize: take ?? total,
            totalPages: take ? Math.ceil(total / take) : 1,
        }

        return { data: roles, meta };
    }

    public async changeUserRole({ userId, role }: ChangeRoleDto): Promise<void> {
        const startTime = Date.now();

        const [roleEntity, user] = await Promise.all([
            this.roleRepository
                .findOne({ where: { assignedEnum: role } })
                .catch((error) => {
                    void this.logger.error(
                        `Failed to fetch role with assignedEnum: ${role} from the database.`,
                        {
                            error: error as Error,
                            startTime,
                            tag: LogTypeEnum.DATABASE_FAIL,
                        },
                    );
                    throw new NotFoundException(
                        `Failed to fetch role with assignedEnum: ${role} from the database.`,
                    );
                }),
            this.userRepository
                .findOne({ where: { id: userId }, relations: { roles: true } })
                .catch((error) => {
                    void this.logger.error(
                        `Failed to fetch user with id: ${userId} from the database.`,
                        {
                            error: error as Error,
                            startTime,
                            tag: LogTypeEnum.DATABASE_FAIL,
                        },
                    );
                    throw new NotFoundException(
                        `Failed to fetch user with id: ${userId} from the database.`,
                    );
                }),
        ]);

        if (!roleEntity) {
            throw new NotFoundException(`Role with assignedEnum: ${role} not found.`);
        }

        if (!user) {
            throw new NotFoundException(`User with id: ${userId} not found.`);
        }

        if (user.roles.some(({ assignedEnum }) => assignedEnum === role)) {
            this.logger.warn(
                `User with id: ${userId} already has role with assignedEnum: ${role} attached.`,
                { startTime, tag: LogTypeEnum.PERMISSIONS_FAIL },
            );
            throw new ConflictException(
                `User with id: ${userId} already has role with assignedEnum: ${role} attached.`,
            );
        }

        user.roles = [roleEntity];

        await this.userRepository.save(user).catch((error) => {
            this.logger.error(`Failed to save user role change in the database.`, {
                error: error as Error,
                startTime,
                tag: LogTypeEnum.DATABASE_FAIL,
            });
            throw new InternalServerErrorException(
                `Failed to save user role change in the database.`,
            );
        });
    }

    public async changeUserPermissions({
        userToPermissionPairs,
        action,
    }: ChangeUserPermissionsParams): Promise<void> {
        const startTime = Date.now();
        const errors: Error[] = [];

        const userIds = new Set<number>(userToPermissionPairs.map(({ userId }) => userId));
        const permissionIds = new Set<number>(
            userToPermissionPairs.map(({ permissionId }) => permissionId),
        );

        const users = await this.userRepository
            .find({
                where: { id: In([...userIds]) },
                relations: { permissions: true },
            })
            .catch((error) => {
                void this.logger.error(`Failed to fetch users for changing permissions.`, {
                    error: error as Error,
                    startTime,
                });
                throw new NotFoundException(
                    `Failed to fetch users for changing permissions.`,
                );
            });

        const permissions = await this.permissionRepository
            .find({
                where: { id: In([...permissionIds]) },
            })
            .catch((error) => {
                void this.logger.error(
                    `Failed to fetch permissions for changing user permissions.`,
                    {
                        error: error as Error,
                        startTime,
                    },
                );
                throw new NotFoundException(
                    `Failed to fetch permissions for changing user permissions.`,
                );
            });

        const usersMap = new Map<number, UserEntity>(users.map((user) => [user.id, user]));
        const permissionsMap = new Map<number, PermissionEntity>(
            permissions.map((permission) => [permission.id, permission]),
        );

        for (const { userId, permissionId } of userToPermissionPairs) {
            if (!permissionsMap.has(permissionId)) {
                errors.push(
                    new NotFoundException(`Permission with id: ${permissionId} not found.`),
                );
                continue;
            }

            if (!usersMap.has(userId)) {
                errors.push(new NotFoundException(`User with id: ${userId} not found.`));
                continue;
            }

            const user = usersMap.get(userId);
            const permission = permissionsMap.get(permissionId);

            if (
                action === ChangeUserPermissionsActionEnum.ATTACH &&
                user.permissions.some(({ id }) => id === permissionId)
            ) {
                this.logger.warn(
                    `User with id: ${userId} already has permission with id: ${permissionId} attached.`,
                    { startTime, tag: LogTypeEnum.PERMISSIONS_FAIL },
                );
                continue;
            }

            if (
                action === ChangeUserPermissionsActionEnum.DETACH &&
                !user.permissions.some(({ id }) => id === permissionId)
            ) {
                this.logger.warn(
                    `User with id: ${userId} doesn't have permission with id: ${permissionId} attached, so it can't be detached.`,
                    { startTime, tag: LogTypeEnum.PERMISSIONS_FAIL },
                );
                continue;
            }

            if (action === ChangeUserPermissionsActionEnum.ATTACH) {
                user.permissions.push(permission);
            } else if (action === ChangeUserPermissionsActionEnum.DETACH) {
                user.permissions = user.permissions.filter(({ id }) => id !== permissionId);
            }
        }

        await this.userRepository.save(users).catch((error) => {
            this.logger.error(`Failed to save user-permission changes in the database.`, {
                startTime,
                error: error as Error,
                tag: LogTypeEnum.DATABASE_FAIL,
            });
            errors.push(error);
        });

        if (errors.length > 0) {
            throw new AggregateError(
                errors,
                `Failed to change permissions for some of the provided user-permission pairs.`,
            );
        }
    }
}
