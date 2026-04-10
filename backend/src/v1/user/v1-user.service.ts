import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    OnApplicationBootstrap,
} from "@nestjs/common";
import {
    PermissionEntity,
    RedirectionEntity,
    RoleEntity,
    UserEntity,
} from "@libs/entities";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { ActiveUserPayload, GetEntitiesResponse } from "@libs/types";
import { BasicSearchQueryParamsDto } from "@libs/dtos";
import { BucketEnum, LogTypeEnum, PermissionEnum } from "@libs/enums";
import { S3Service } from "@libs/s3";

@Injectable()
export class V1UserService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(V1UserService)
        private readonly logger: Logger,
        private readonly minio: S3Service,
    ) { }

    public async onApplicationBootstrap() {

        const bucketExists = await this.minio.bucketExists(BucketEnum.USER_AVATARS);
        if (!bucketExists) {
            await this.minio.createBucket(BucketEnum.USER_AVATARS);
        }

        const element = await this.minio.getObject(BucketEnum.USER_AVATARS, `test-object`).catch(() => { 
            this.logger.warn(`error on null`)
        });

        this.logger.warn(`here i am :D`)
        this.logger.debug(element);

    }

    private validateUserPermissionToAccessResource(
        userId: number,
        id: number,
        permissions: PermissionEnum[]
    ): void {
        if (userId !== id && !permissions.includes(PermissionEnum.MANAGE_OTHER_ACCOUNT)) {
            throw new ForbiddenException(
                `You do not have permission to access this resource.`,
            );
        }
    }

    public async getUsers(
        { take, skip }: BasicSearchQueryParamsDto
    ): Promise<GetEntitiesResponse<UserEntity>> {

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
    ): Promise<UserEntity> {

        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const user = await this.userRepository
            .findOne({
                where: { id: userId },
                relations: {
                    roles: { permissions: true },
                    permissions: true,
                    redirections: true,
                    logs: true,
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

    public async updateUserData(
        userId: number,
        { id, permissions }: ActiveUserPayload,
        { }: unknown,
    ): Promise<void> { }

    public async getUserPermissions(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<PermissionEntity[]> {

        this.validateUserPermissionToAccessResource(userId, id, permissions);
        return [];
    }

    public async getUserRoles(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RoleEntity[]> {
        this.validateUserPermissionToAccessResource(userId, id, permissions);
        return [];
    }

    public async getUserRedirections(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RedirectionEntity[]> {
        this.validateUserPermissionToAccessResource(userId, id, permissions);
        return [];
    }

    public async deleteAccount(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<void> {
        if (userId !== id && !permissions.includes(PermissionEnum.DELETE_OTHER_ACCOUNT)) {
            throw new ForbiddenException(
                `You do not have permission to access this resource.`,
            );
        }
    }

    public async getUserAvatar(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<Buffer> {

        const startTime = Date.now();
        this.validateUserPermissionToAccessResource(userId, id, permissions);
        const avatarBuffer = await this.minio
            .getObject(BucketEnum.USER_AVATARS, `avatar-${userId}`)
            .catch((error) => {
                this.logger.error(
                    `Failed to get user avatar from storage for userId: ${userId}.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_READ_FAIL, startTime },
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
        avatar: ArrayBufferLike,
    ): Promise<void> {
        this.validateUserPermissionToAccessResource(userId, id, permissions);

        const existingAvatar = await this.minio.getObject(BucketEnum.USER_AVATARS, `avatar-${userId}`);

        // await this.minio.putObject()
    }

    public async updateUserAvatar(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<void> {
        this.validateUserPermissionToAccessResource(userId, id, permissions);
    }

    public async deleteUserAvatar(
        userId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<void> {
        this.validateUserPermissionToAccessResource(userId, id, permissions);
    }
}
