import { BearerTokenGuardService } from "./bearer-token-guard.service";
import { PermissionGuard } from "./permission-guard.service";
import { CookieGuardService } from "./cookie-guard.service";
import { DatabaseModule } from "@libs/database";
import { LoggerModule } from "@libs/logger";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";

const providers = [BearerTokenGuardService, CookieGuardService, PermissionGuard, AuthGuard];
@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({ secret: process.env.SECRET }),
        LoggerModule.forFeature(providers),
    ],
    providers,
    exports: providers,
})
export class GuardsModule {}
