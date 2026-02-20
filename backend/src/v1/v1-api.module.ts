import { V1PermissionModule } from "./permission";
import { V1RedirectionModule } from "./redirection";
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { V1UserModule } from "./user";
import { V1AuthModule } from "./auth";

const AllV1ApiModules = [
    V1AuthModule,
    V1PermissionModule,
    V1RedirectionModule,
    V1UserModule,
]

@Module({
    imports: AllV1ApiModules,
    exports: AllV1ApiModules,
})

export class V1ApiModule implements OnModuleInit {

    public async onModuleInit() {
        Logger.warn(process.env.MAIN_DATABASE_HOST)
        Logger.warn(process.env.MAIN_DATABASE_PORT)
        Logger.warn(process.env.MAIN_DATABASE_NAME)
        Logger.warn(process.env.MAIN_DATABASE_PASS)
        Logger.warn(process.env.MAIN_DATABASE_USER)
        Logger.warn(process.env.MAIN_DATABASE_HOST)
    }

 }