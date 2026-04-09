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
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    private async callCacheRefresh(): Promise<void> {
        await this.cacheMostCommonRedirections();
    }

    public async onApplicationBootstrap() {
        await this.cacheMostCommonRedirections();
    }

    public async cacheMostCommonRedirections(): Promise<void> {

        try {

            await this.cacheManager.clear().catch(error => {
                this.logger.error(`Failed to clear cache during caching most common redirections.`, {
                    error: error as Error, tag: LogTypeEnum.SYNCHRONIZATION_FAIL,
                });
            });

            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const mostCommonRedirections = await this.redirectionRepository
                .createQueryBuilder('redirection')
                .addSelect((sub) =>
                    sub.select('COUNT(r.id)', 'requestCount')
                        .from(HttpRequestEntity, 'r')
                        .where('r.redirectionId = redirection.id')
                        .andWhere('r.requestTimestamp >= :thirtyDaysAgo', { thirtyDaysAgo }), 'requestCount',
                )
                .orderBy('requestCount', 'DESC')
                .take(1024)
                .getMany();

            await Promise.all(mostCommonRedirections.map(async ({ route, targetUrl }) => {
                return this.cacheManager.set(route, targetUrl, 60 * 60 * 24 * 1000);
            }));

        } catch (error) {
            this.logger.error(`Failed to cache most common redirections.`, {
                error: error as Error, tag: LogTypeEnum.SYNCHRONIZATION_FAIL,
            });
        }


    }





}
