import { V1RedirectionController } from "./v1-redirection.controller";
import { V1RedirectionService } from "./v1-redirection.service";
import { CacheModule } from "@nestjs/cache-manager";
import { DatabaseModule } from "@libs/database";
import { LoggerModule } from "@libs/logger";
import { CacheableMemory } from "cacheable";
import { GuardsModule } from "@libs/guards";
import { Module } from "@nestjs/common";
import KeyvRedis from "@keyv/redis";
import { Keyv } from "keyv";

@Module({
    imports: [
        DatabaseModule,
        GuardsModule,
        LoggerModule.forFeature([V1RedirectionService, V1RedirectionController]),
        CacheModule.register({
            stores: [
                new KeyvRedis(
                    `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
                ),
                new Keyv({
                    store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
                }),
            ],
        }),
    ],
    controllers: [V1RedirectionController],

    providers: [V1RedirectionService],
})
export class V1RedirectionModule {}
