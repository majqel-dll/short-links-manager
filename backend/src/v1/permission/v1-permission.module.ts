import { V1PermissionController } from "./v1-permission.controller";
import { V1PermissionService } from "./v1-permission.service";
import { DatabaseModule } from "@libs/database";
import { GuardsModule } from "@libs/guards";
import { LoggerModule } from "@libs/logger";
import { Module } from "@nestjs/common";

@Module({
    imports: [GuardsModule, LoggerModule.forFeature([V1PermissionService]), DatabaseModule],
    controllers: [V1PermissionController],
    providers: [V1PermissionService],
})
export class V1PermissionModule {}
