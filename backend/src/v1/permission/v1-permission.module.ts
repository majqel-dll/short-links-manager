import { LoggerModule } from "@libs/logger";
import { V1PermissionController } from "./v1-permission.controller";
import { V1PermissionService } from "./v1-permission.service";
import { Module } from "@nestjs/common";
import { DatabaseModule } from "@libs/database";

@Module({
    imports: [LoggerModule.forFeature([V1PermissionService]), DatabaseModule],
    controllers: [V1PermissionController],
    providers: [V1PermissionService],
})
export class V1PermissionModule {}
