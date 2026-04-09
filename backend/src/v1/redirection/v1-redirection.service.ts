import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { HttpRequestEntity, RedirectionEntity } from "@libs/entities";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";
import { LogTypeEnum } from "@libs/enums";

@Injectable()
export class V1RedirectionService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(RedirectionEntity)
        private readonly redirectionRepository: Repository<RedirectionEntity>,
        @InjectLogger(V1RedirectionService)
        private readonly logger: Logger,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
    ) {}

    public async onApplicationBootstrap() {
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

            const mostCommonRedirections = await this.redirectionRepository
                .createQueryBuilder("redirection")
                .addSelect(
                    (sub) =>
                        sub
                            .select("COUNT(r.id)", "requestCount")
                            .from(HttpRequestEntity, "r")
                            .where("r.redirectionId = redirection.id")
                            .andWhere("r.requestTimestamp >= :thirtyDaysAgo", {
                                thirtyDaysAgo,
                            }),
                    "requestCount",
                )
                .orderBy("requestCount", "DESC")
                .take(1024)
                .getMany();

            const allDayInMiliseconds = 24 * 60 * 60 * 1000;
            const cacheResults = await Promise.allSettled(
                mostCommonRedirections.map(async ({ route, targetUrl }) => {
                    return this.cacheManager.set(
                        route,
                        targetUrl,
                        timeToTheNextMidnightInMs ?? allDayInMiliseconds,
                    );
                }),
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
}
