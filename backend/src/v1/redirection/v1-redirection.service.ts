import { HttpRequestEntity, RedirectionEntity, UserEntity } from "@libs/entities";
import { ActiveUserPayload, GetEntitiesResponse } from "@libs/types";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { LogTypeEnum, PermissionEnum } from "@libs/enums";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { In, Repository } from "typeorm";
import { Logger } from "@libs/logger";
import {
    InternalServerErrorException,
    OnApplicationBootstrap,
    ConflictException,
    Injectable,
    Inject,
} from "@nestjs/common";
import {
    BasicSearchQueryParamsDto,
    CreateRedirectionDto,
    UpdateRedirectionDto,
} from "@libs/dtos";

@Injectable()
export class V1RedirectionService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(RedirectionEntity)
        private readonly redirectionRepository: Repository<RedirectionEntity>,
        @InjectRepository(HttpRequestEntity)
        private readonly httpRequestRepository: Repository<HttpRequestEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(V1RedirectionService)
        private readonly logger: Logger,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) { }

    public async onApplicationBootstrap(): Promise<void> {
        const timeToTheNextMidnightInMs = new Date().setHours(24, 0, 0, 0) - Date.now();
        await this.cacheMostCommonRedirections(timeToTheNextMidnightInMs);
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { waitForCompletion: true })
    public async cacheMostCommonRedirections(
        timeToTheNextMidnightInMs?: number,
    ): Promise<void> {
        const startTime = Date.now();
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const mostCommonRedirectionRows = await this.redirectionRepository
                .createQueryBuilder("redirection")
                .leftJoin(
                    HttpRequestEntity,
                    "request",
                    "request.redirectionId = redirection.id AND request.requestTimestamp >= :thirtyDaysAgo",
                    { thirtyDaysAgo },
                )
                .select("redirection.id", "id")
                .addSelect("COUNT(request.id)", "requestCount")
                .groupBy("redirection.id")
                .orderBy("COUNT(request.id)", "DESC")
                .addOrderBy("redirection.id", "ASC")
                .limit(1024)
                .getRawMany<{ id: number; requestCount: string }>();

            const sortedIds = mostCommonRedirectionRows.map((row) => Number(row.id));
            const mostCommonRedirections =
                sortedIds.length > 0
                    ? await this.redirectionRepository.find({
                        where: { id: In(sortedIds) },
                        relations: { user: true },
                    })
                    : [];

            const redirectionById = new Map(
                mostCommonRedirections.map((redirection) => [redirection.id, redirection]),
            );
            const orderedMostCommonRedirections = sortedIds
                .map((id) => redirectionById.get(id))
                .filter(
                    (redirection): redirection is RedirectionEntity =>
                        redirection !== undefined,
                );

            const allDayInMiliseconds = 24 * 60 * 60 * 1000;
            const cacheResults = await Promise.allSettled(
                orderedMostCommonRedirections.map(
                    async ({ id, route, isPremium, user, targetUrl }) => {
                        const cacheKey = isPremium ? route : `${user?.login}/${route}`;
                        return this.cacheManager.set(
                            cacheKey,
                            `${id}$$$:${targetUrl}`,
                            timeToTheNextMidnightInMs ?? allDayInMiliseconds,
                        );
                    },
                ),
            );

            const failedCaches = cacheResults.filter(
                (result) => result.status === "rejected",
            );
            if (failedCaches.length > 0) {
                this.logger.error(`Failed to cache ${failedCaches.length} redirections.`, {
                    tag: LogTypeEnum.SYNCHRONIZATION_FAIL,
                    startTime,
                });
            }

            const successfulCaches = cacheResults.filter(
                (result) => result.status === "fulfilled",
            );
            if (successfulCaches.length > 0) {
                this.logger.log(`Successfully cached most common redirections.`, {
                    tag: LogTypeEnum.SYNCHRONIZATION,
                    startTime,
                });
            }
        } catch (error) {
            this.logger.error(`Failed to cache most common redirections.`, {
                error: error as Error,
                tag: LogTypeEnum.SYNCHRONIZATION_FAIL,
                startTime,
            });
        }
    }

    public async findRedirectionByRoute(route: string): Promise<string> {
        const cachedRedirection = await this.cacheManager.get<string>(route);
        if (cachedRedirection) {
            return cachedRedirection;
        }

        const segments = route.split(`/`);
        const redirection = await this.redirectionRepository.findOne({
            where: [
                { route, isPremium: true },
                {
                    user: { login: segments[0] },
                    route: segments.slice(1).join("/"),
                    isPremium: false,
                },
            ],
            select: { id: true, targetUrl: true },
        });

        if (redirection) {
            const { id, targetUrl } = redirection;
            await this.cacheManager.set(
                route,
                `${id}$$$:${targetUrl}`,
                24 * 60 * 60 * 1000,
            );
            return `${id}$$$:${targetUrl}`;
        }

        return null;
    }

    public async connectRedirectionWithRequest(
        requestId: number,
        redirectionId: number,
    ): Promise<void> {
        try {
            await this.httpRequestRepository.update({ id: requestId }, { redirectionId });
        } catch (error) {
            this.logger.error(
                `Failed to connect redirection with id: ${redirectionId} with request with id: ${requestId} in the database.`,
                {
                    error: error as Error,
                    tag: LogTypeEnum.DATABASE_FAIL,
                },
            );
        }
    }

    public async getRedirectionsByUserId(
        userId: number,
        { id, permissions }: ActiveUserPayload,
        { take, skip }: BasicSearchQueryParamsDto = {},
    ): Promise<
        GetEntitiesResponse<
            RedirectionEntity & { totalClicks: number; recentClicks: number }
        >
    > {
        const startTime: number = Date.now();
        if (userId !== id && !permissions.includes(PermissionEnum.READ_OTHER_REDIRECTION)) {
            this.logger.error(
                `User with id: ${id} attempted to access redirections of user with id: ${userId} without proper permissions.`,
                {
                    error: new Error(
                        `Insufficient permissions to access redirections of user with id: ${userId}.`,
                    ),
                    tag: LogTypeEnum.PERMISSIONS_FAIL,
                    startTime,
                },
            );
            throw new InternalServerErrorException(
                `User with id: ${id} does not have permissions to access redirections of user with id: ${userId}.`,
            );
        }

        const [redirections, total] = await this.redirectionRepository
            .findAndCount({
                where: { userId },
                order: { createdAt: "DESC" },
                take,
                skip,
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch redirections of user with id: ${userId} from the database.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch redirections of user with id: ${userId} from the database.`,
                );
            });

        const clickMap = new Map<number, { totalClicks: number; recentClicks: number }>();

        if (redirections.length > 0) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const ids = redirections.map((r) => r.id);
            const clickCounts = await this.httpRequestRepository
                .createQueryBuilder("req")
                .select("req.redirectionId", "redirectionId")
                .addSelect("COUNT(req.id)", "totalClicks")
                .addSelect(
                    "COUNT(CASE WHEN req.requestTimestamp >= :thirtyDaysAgo THEN 1 END)",
                    "recentClicks",
                )
                .where("req.redirectionId IN (:...ids)", { ids })
                .setParameter("thirtyDaysAgo", thirtyDaysAgo)
                .groupBy("req.redirectionId")
                .getRawMany<{
                    redirectionId: number;
                    totalClicks: string;
                    recentClicks: string;
                }>();

            for (const row of clickCounts) {
                clickMap.set(Number(row.redirectionId), {
                    totalClicks: Number(row.totalClicks),
                    recentClicks: Number(row.recentClicks),
                });
            }
        }

        const data = redirections.map((redirection) => ({
            ...redirection,
            totalClicks: clickMap.get(redirection.id)?.totalClicks ?? 0,
            recentClicks: clickMap.get(redirection.id)?.recentClicks ?? 0,
        })) as (RedirectionEntity & { totalClicks: number; recentClicks: number })[];

        const meta = {
            totalRecords: total,
            currentPage: skip ?? 0,
            pageSize: take ?? total,
            totalPages: take ? Math.ceil(total / take) : 1,
        };

        return { data, meta };
    }

    public async getRedirectionById(
        redirectionId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RedirectionEntity> {
        const startTime: number = Date.now();
        const redirection = await this.redirectionRepository
            .findOne({
                where: { id: redirectionId },
                relations: { user: true },
            })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch redirection with id: ${redirectionId} from the database.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch redirection with id: ${redirectionId} from the database.`,
                );
            });

        if (!redirection) {
            throw new InternalServerErrorException(
                `Redirection with id: ${redirectionId} not found in the database.`,
            );
        }

        if (
            redirection.user?.id !== id &&
            !permissions.includes(PermissionEnum.READ_OTHER_REDIRECTION)
        ) {
            throw new InternalServerErrorException(
                `Redirection with id: ${redirectionId} does not belong to user with id: ${id}.`,
            );
        }

        const userName = redirection.user.login;
        delete redirection.user;

        redirection.user = { login: userName } as UserEntity;
        return redirection;

    }

    public async createRedirection(
        { isPremium, targetUrl, route }: CreateRedirectionDto,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RedirectionEntity> {
        const startTime: number = Date.now();
        if (
            isPremium === true &&
            !permissions.includes(PermissionEnum.CREATE_PREMIUM_REDIRECTION)
        ) {
            throw new InternalServerErrorException(
                `User with id: ${id} does not have permissions to create premium redirections.`,
            );
        }

        const { login } = await this.userRepository.findOne({ where: { id } }).catch((error) => {
            this.logger.error(
                `Failed to fetch user with id: ${id} from the database while creating redirection.`,
                { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
            );
            throw new InternalServerErrorException(
                `Failed to fetch user with id: ${id} from the database while creating redirection.`,
            );
        });

        const newRedirection = this.redirectionRepository.create({
            isPremium,
            route,
            targetUrl,
            userId: id,
        });

        return await this.redirectionRepository.save(newRedirection).catch((error) => {
            this.logger.error(
                `Failed to create new redirection for user with id: ${id} in the database.`,
                { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
            );
            throw new InternalServerErrorException(
                `Failed to create new redirection for user ${login} in the database.`,
            );
        });
    }

    public async updateRedirection(
        { route, targetUrl, isPremium, redirectionId }: UpdateRedirectionDto,
        { id, permissions }: ActiveUserPayload,
    ): Promise<RedirectionEntity> {
        const startTime: number = Date.now();
        const redirection = await this.redirectionRepository
            .findOne({ where: { id: redirectionId }, relations: { user: true } })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch redirection with id: ${redirectionId} from the database.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch redirection with id: ${redirectionId} from the database.`,
                );
            });

        if (!redirection) {
            throw new InternalServerErrorException(
                `Redirection with id: ${redirectionId} not found in the database.`,
            );
        }

        if (
            redirection.user?.id !== id &&
            !permissions.includes(PermissionEnum.MANAGE_OTHER_REDIRECTIONS)
        ) {
            throw new InternalServerErrorException(
                `Redirection with id: ${redirectionId} does not belong to user with id: ${id}.`,
            );
        }

        if (route) {
            redirection.route = route;
        }

        if (targetUrl) {
            redirection.targetUrl = targetUrl;
        }

        if (isPremium !== undefined) {
            if (
                isPremium === true &&
                !permissions.includes(PermissionEnum.CREATE_PREMIUM_REDIRECTION)
            ) {
                throw new InternalServerErrorException(
                    `User with id: ${id} does not have permissions to create premium redirections.`,
                );
            }
            redirection.isPremium = isPremium;
        }

        return await this.redirectionRepository.save(redirection).catch((error) => {
            const pgCode =
                typeof error === `object` && error !== null && `code` in error
                    ? (error as { code?: unknown }).code
                    : null;
            if (pgCode === `23505`) {
                throw new ConflictException(
                    `Redirection with route "${redirection.route}" already exists.`,
                );
            }
            this.logger.error(
                `Failed to update redirection with id: ${redirectionId} in the database.`,
                { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
            );
            throw new InternalServerErrorException(
                `Failed to update redirection with id: ${redirectionId} in the database.`,
            );
        });
    }

    public async deleteRedirection(
        redirectionId: number,
        { id, permissions }: ActiveUserPayload,
    ): Promise<void> {
        const startTime: number = Date.now();
        const redirection = await this.redirectionRepository
            .findOne({ where: { id: redirectionId }, relations: { user: true } })
            .catch((error) => {
                this.logger.error(
                    `Failed to fetch redirection with id: ${redirectionId} from the database.`,
                    { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
                );
                throw new InternalServerErrorException(
                    `Failed to fetch redirection with id: ${redirectionId} from the database.`,
                );
            });

        if (!redirection) {
            throw new InternalServerErrorException(
                `Redirection with id: ${redirectionId} not found in the database.`,
            );
        }

        if (
            redirection.user?.id !== id &&
            !permissions.includes(PermissionEnum.MANAGE_OTHER_REDIRECTIONS)
        ) {
            throw new InternalServerErrorException(
                `Redirection with id: ${redirectionId} does not belong to user with id: ${id}.`,
            );
        }

        await this.redirectionRepository.delete(redirection).catch((error) => {
            this.logger.error(
                `Failed to delete redirection with id: ${redirectionId} from the database.`,
                { error: error as Error, tag: LogTypeEnum.DATABASE_FAIL, startTime },
            );
            throw new InternalServerErrorException(
                `Failed to delete redirection with id: ${redirectionId} from the database.`,
            );
        });

        const route = redirection.isPremium
            ? redirection.route
            : `${redirection.user?.login}/${redirection.route}`;

        this.cacheManager.del(route).catch((error) => {
            this.logger.error(
                `Failed to delete redirection with route: ${route} from the cache after deletion from the database.`,
                { error: error as Error, tag: LogTypeEnum.DELETE_FAIL, startTime },
            );
        });

        this.logger.log(
            `Redirection with id: ${redirectionId} has been deleted from the database.`,
            { tag: LogTypeEnum.DELETED, startTime },
        );
    }

    public async isRouteAvailable(
        route: string,
        isPremium = false,
        { id, permissions }: ActiveUserPayload,
    ): Promise<boolean> {
        if (!permissions.includes(PermissionEnum.CREATE_PREMIUM_REDIRECTION) && isPremium) {
            return false;
        }

        const cachedRedirection = await this.cacheManager.get<string>(route);
        if (cachedRedirection) {
            return false;
        }

        const where = isPremium
            ? { route, isPremium: true }
            : { route, isPremium: false, user: { id } };

        const redirection = await this.redirectionRepository.findOne({ where });
        return redirection === null;
    }
}
