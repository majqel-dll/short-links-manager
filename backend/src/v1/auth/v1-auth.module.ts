import { V1AuthController } from "./v1-auth.controller";
import { V1AuthService } from "./v1-auth.service";
import { DatabaseModule } from "@libs/database";
import { GuardsModule } from "@libs/guards";
import { LoggerModule } from "@libs/logger";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        GuardsModule,
        LoggerModule.forFeature([V1AuthService, V1AuthController]),
        DatabaseModule,
    ],
    controllers: [V1AuthController],
    providers: [V1AuthService],
})
export class V1AuthModule {}
