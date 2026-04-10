import { DatabaseModule } from "@libs/database";
import { V1UserController } from "./v1-user.controller";
import { V1UserService } from "./v1-user.service";
import { Module } from "@nestjs/common";
import { LoggerModule } from "@libs/logger";
import { GuardsModule } from "@libs/guards";

@Module({
    imports: [
        DatabaseModule,
        LoggerModule.forFeature([V1UserService, V1UserController]),
        GuardsModule,
    ],
    controllers: [V1UserController],
    providers: [V1UserService],
})
export class V1UserModule {}
