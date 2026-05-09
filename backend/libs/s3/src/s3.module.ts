import { LoggerModule } from "@libs/logger";
import { S3Service } from "./s3.service";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), LoggerModule.forFeature(S3Service)],
    providers: [S3Service],
    exports: [S3Service],
})
export class S3Module {}
