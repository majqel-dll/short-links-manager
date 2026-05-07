
import { BucketEnum, CodeActionEnum, LogTypeEnum, PermissionEnum } from "@libs/enums";
import { ActiveUserPayload, GetEntitiesResponse } from "@libs/types";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { V1CodeService } from "../code";
import { Logger } from "@libs/logger";
import { S3Service } from "@libs/s3";
import { DataSource, Repository } from "typeorm";
import {
    InternalServerErrorException,
    OnApplicationBootstrap,
    ForbiddenException,
    NotFoundException,
    Injectable,
    BadRequestException,
} from "@nestjs/common";
import {
    RedirectionEntity,
    PermissionEntity,
    RoleEntity,
    UserEntity,
    CodeEntity,
} from "@libs/entities";
import sharp from "sharp";
import argon from "argon2";
import {
    BasicSearchQueryParamsDto,
    GetUserQueryParamsDto,
    CreateUserByPanelDto,
    UpdateUserDto,
} from "@libs/dtos";

@Injectable()
export class V1UserService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(CodeEntity)
        private readonly codeRepository: Repository<CodeEntity>,
        @InjectLogger(V1UserService)
        private readonly logger: Logger,
        private readonly codeService: V1CodeService,
        private readonly dataSource: DataSource,
        private readonly minio: S3Service,
    ) { }

    public async onApplicationBootstrap() {
        const bucketExists = await this.minio.bucketExists(BucketEnum.USER_AVATARS);
        if (!bucketExists) {
            await this.minio.createBucket(BucketEnum.USER_AVATARS);
        }
    }

    private validateUserPermissionToAccessResource(
        userId: number,
        id: number,
        permissions: PermissionEnum[],
    ): void {
        if (userId !== id && !permissions.includes(PermissionEnum.MANAGE_OTHER_ACCOUNT)) {
            throw new ForbiddenException(
                `You do not have permission to access this resource.`,
            );
        }
    }

    public async getUsers({
        take,
        skip,
    }: BasicSearchQueryParamsDto): Promise<GetEntitiesResponse<UserEntity>> {
        const startTime = Date.now();
        const [users, total] = await this.userRepository
            .findAndCount({
                order: { createdAt: "DESC" },
                take,
                skip,
            })
            .catch((error) => {
                this.logger.error(`Failed to fetch users data from the database.`, {
                    error: error as Error,
                    tag: LogTypeEnum.DATABASE_FAIL,
                    startTime,
                });
                throw new InternalServerErrorException(
                    `Failed to fetch users data from the database.`,
                );
            });

        const meta = {
            totalRecords: total,
            currentPage: skip ?? 0,
            pageSize: take ?? total,
            totalPages: take ? Math.ceil(total / take) : 1,
        };

        return {
            data: users,
            meta,
        };
    }

    public async getUserById(
        userId: number,
        { id, permissions }: ActiveUserPayload,
        queryParams: GetUserQueryParamsDto,
    ): Promise<UserEntity> {
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const {
            logs,
            requests,
            permissions: queryPermissions,
            redirections,
            roles,
        } = queryParams;
        const user = await this.userRepository
            .findOne({
                where: { id: userId },
                relations: {
                    roles: roles ? { permissions: true } : false,
                    permissions: queryPermissions,
                    redirections,
                    logs,
                    requests,
                },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch user data from the database for userId: ${userId}.`,
                    {
                        error: error as Error,
                        tag: LogTypeEnum.DATABASE_FAIL,
                        startTime: Date.now(),
                    },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch user data from the database for userId: ${userId}.`,
                );
            });

        return user;
    }

    public async createUserByPanel(payload: CreateUserByPanelDto): Promise<UserEntity> {
        return null;
    }

    public async updateUserData(
        userId: number,
        { id, permissions }: ActiveUserPayload,
        { newLogin, newEmail, currentPassword }: UpdateUserDto,
    ): Promise<void> {
        const startTime: number = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const user = await this.userRepository
            .findOne({
                where: { id: userId },
                relations: { permissions: true },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch user permissions from the database for userId: ${userId}.`,
                    {
                        error: error as Error,
                        tag: LogTypeEnum.DATABASE_FAIL,
                        startTime: Date.now(),
                    },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch user permissions from the database for userId: ${userId}.`,
                );
            });

        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found.`);
        }

        const isPasswordValid = await argon.verify(user.passwordHash, currentPassword);
        if (!isPasswordValid) {
            throw new ForbiddenException(`Current password is incorrect.`);
        }

        if (newLogin) {
            user.login = newLogin;
        }
        if (newEmail) {
            user.email = newEmail;
        }

        await this.userRepository.save(user).catch((error) => {
            this.logger.error(
                `Failed to update user data in the database for userId: ${userId}.`,
                { error: error as Error, tag: LogTypeEnum.UPDATE_FAIL, startTime },
            );
            throw new InternalServerErrorException(
                `Failed to update user data in the database for userId: ${userId}.`,
            );
        });
    }

    public async getUserPermissions(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<PermissionEntity[]> {
        const startTime: number = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const user = await this.userRepository
            .findOne({
                where: { id: userId },
                relations: {
                    permissions: true,
                    roles: { permissions: true },
                },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch user permissions from the database for userId: ${userId}.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch user permissions from the database for userId: ${userId}.`,
                );
            });

        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found.`);
        }

        const assignedPermissions = new Set<PermissionEntity>();
        user.permissions?.forEach((permission) => assignedPermissions.add(permission));
        user.roles?.forEach((role) =>
            role.permissions.forEach((permission) => assignedPermissions.add(permission)),
        );

        return Array.from(assignedPermissions);
    }

    public async getUserRoles(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RoleEntity[]> {
        const startTime = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const user = await this.userRepository
            .findOne({
                where: { id: userId },
                relations: { roles: { permissions: true } },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch user roles from the database for userId: ${userId}.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch user roles from the database for userId: ${userId}.`,
                );
            });

        return user?.roles || [];
    }

    public async getUserRedirections(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RedirectionEntity[]> {
        const startTime = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const user = await this.userRepository
            .findOne({
                where: { id: userId },
                relations: { redirections: true },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch user redirections from the database for userId: ${userId}.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch user redirections from the database for userId: ${userId}.`,
                );
            });

        return user?.redirections || [];
    }

    public async requestToDeleteAccount(): Promise<boolean> {


        await this.codeService.sendVerificationCodeToEmail(
            { id: 0 }, CodeActionEnum.DELETE_ACCOUNT_CONFIRM
        );

        return true;
    }

    public async deleteAccount(
        userId: number,
        activeUser: ActiveUserPayload,
        code?: string,
    ): Promise<void> {
        const startTime: number = Date.now();

        if (code) {
            const codeEntity = await this.codeRepository.findOne({
                where: { code, action: CodeActionEnum.DELETE_ACCOUNT_CONFIRM },
                relations: { user: true },
            }).catch((error) => {
                this.logger.error(
                    `Failed to fetch code data from the database for code: ${code}.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch code data from the database for code: ${code}.`,
                );
            })

            if (!codeEntity) {
                this.logger.warn(`Attempt to change password with invalid code: ${code}`, {
                    startTime,
                    tag: LogTypeEnum.WARN,
                });
                throw new BadRequestException(`Invalid reset password code.`);
            }

            if (codeEntity.expiresAt && codeEntity.expiresAt < new Date()) {
                this.logger.warn(`Attempt to use expired code: ${code}`, {
                    startTime,
                    tag: LogTypeEnum.WARN,
                });
                throw new BadRequestException(`This reset password code has expired.`);
            }

            if (codeEntity.user.id !== userId) {
                this.logger.warn(`Attempt to use code: ${code} for userId: ${userId} which does not match code owner userId: ${codeEntity.user.id}`, {
                    startTime,
                    tag: LogTypeEnum.WARN,
                });
                throw new BadRequestException(`Invalid reset password code.`);
            }

        }

        await this.dataSource.transaction(async (manager) => {

            await manager.delete(UserEntity, { id: userId }).catch((error) => {
                this.logger.error(
                    `Failed to delete user with id ${userId} from the database.`,
                    { error: error as Error, tag: LogTypeEnum.DELETE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to delete user with id ${userId} from the database.`,
                );
            });
            
            await this.deleteUserAvatar(userId, activeUser).catch((error) => {
                this.logger.error(
                    `Failed to delete avatar for user with id ${userId} from the storage.`,
                    { error: error as Error, tag: LogTypeEnum.DELETE_FAIL, startTime },
                );
            });

        });
    }

    public async getUserAvatar(userId: number): Promise<Buffer> {
        const startTime = Date.now();
        const avatarBuffer = await this.minio
            .getObject(
                BucketEnum.USER_AVATARS,
                `avatar-${userId.toString().padStart(6, `0`)}.webp`,
            )
            .catch((error) => {
                this.logger.error(
                    `Failed to get user avatar from storage for userId: ${userId}.`,
                    {
                        error: error as Error,
                        tag: LogTypeEnum.DATABASE_READ_FAIL,
                        startTime,
                    },
                );
                throw new InternalServerErrorException(
                    `Failed to get user avatar from storage for userId: ${userId}.`,
                );
            });

        return avatarBuffer;
    }

    public async postUserAvatar(
        userId: number,
        { id, permissions }: ActiveUserPayload,
        avatar: Express.Multer.File,
    ): Promise<void> {
        const startTime = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const processedAvatar = await sharp(avatar.buffer)
            .resize(768, 768, { fit: "inside", withoutEnlargement: true })
            .webp({ quality: 50 })
            .toBuffer()
            .catch((error: Error) => {
                this.logger.error(`Failed to process avatar image for userId: ${userId}.`, {
                    error,
                    tag: LogTypeEnum.CREATE_FAIL,
                    startTime,
                });
                throw new InternalServerErrorException(
                    `Failed to process avatar image for userId: ${userId}.`,
                );
            });

        const existingAvatar = await this.minio
            .getObject(
                BucketEnum.USER_AVATARS,
                `avatar-${userId.toString().padStart(6, `0`)}.webp`,
            )
            .catch((error) => {
                this.logger.error(
                    `No existing avatar found for userId: ${userId}. It will be created.`,
                    {
                        error: error as Error,
                        tag: LogTypeEnum.DATABASE_READ_FAIL,
                        startTime,
                    },
                );
                throw new InternalServerErrorException(
                    `Failed to verify avatar existence from storage for userId: ${userId}.`,
                );
            });

        if (existingAvatar) {
            await this.minio
                .deleteObject(
                    BucketEnum.USER_AVATARS,
                    `avatar-${userId.toString().padStart(6, `0`)}.webp`,
                )
                .catch((error) => {
                    this.logger.error(
                        `Failed to delete existing user avatar from storage for userId: ${userId}.`,
                        { error: error as Error, tag: LogTypeEnum.DELETE_FAIL, startTime },
                    );
                    throw new InternalServerErrorException(
                        `Failed to delete existing user avatar from storage for userId: ${userId}.`,
                    );
                });
        }

        await this.minio
            .putObject(
                BucketEnum.USER_AVATARS,
                `avatar-${userId.toString().padStart(6, `0`)}.webp`,
                processedAvatar,
            )
            .catch((error) => {
                this.logger.error(
                    `Failed to upload user avatar to storage for userId: ${userId}.`,
                    { error: error as Error, tag: LogTypeEnum.CREATE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to upload user avatar to storage for userId: ${userId}.`,
                );
            });
    }

    public async deleteUserAvatar(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<void> {
        const startTime = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const existingAvatar = await this.minio
            .getObject(
                BucketEnum.USER_AVATARS,
                `avatar-${userId.toString().padStart(6, `0`)}.webp`,
            )
            .catch((error) => {
                this.logger.error(
                    `No existing avatar found for userId: ${userId}. It will be created.`,
                    {
                        error: error as Error,
                        tag: LogTypeEnum.DATABASE_READ_FAIL,
                        startTime,
                    },
                );
                throw new InternalServerErrorException(
                    `Failed to verify avatar existence from storage for userId: ${userId}.`,
                );
            });

        if (!existingAvatar) {
            throw new NotFoundException(`Avatar not found for user with id ${userId}.`);
        }

        await this.minio
            .deleteObject(
                BucketEnum.USER_AVATARS,
                `avatar-${userId.toString().padStart(6, `0`)}.webp`,
            )
            .catch((error) => {
                this.logger.error(
                    `Failed to delete user avatar from storage for userId: ${userId}.`,
                    { error: error as Error, tag: LogTypeEnum.DELETE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to delete user avatar from storage for userId: ${userId}.`,
                );
            });
    }
}
