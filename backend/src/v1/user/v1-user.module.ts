import { V1UserController } from "./v1-user.controller";
import { V1UserService } from "./v1-user.service";
import { DatabaseModule } from "@libs/database";
import { GuardsModule } from "@libs/guards";
import { LoggerModule } from "@libs/logger";
import { Module } from "@nestjs/common";
import { V1CodeModule } from "../code";
import { V1AuthModule } from "../auth";
import { S3Module } from "@libs/s3";

@Module({
    imports: [
        DatabaseModule,
        LoggerModule.forFeature([V1UserService, V1UserController]),
        GuardsModule,
        V1CodeModule,
        V1AuthModule,
        S3Module,
    ],
    controllers: [V1UserController],
    providers: [V1UserService],
})
export class V1UserModule {}
