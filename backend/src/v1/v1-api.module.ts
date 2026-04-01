import { Module, OnModuleInit } from "@nestjs/common";
import { onBootstrapMessageUtil } from "@libs/utils";
import { Logger, LoggerModule } from "@libs/logger";
import { V1RedirectionModule } from "./redirection";
import { V1PermissionModule } from "./permission";
import { InjectLogger } from "@libs/decorators";
import { V1UserModule } from "./user";
import { V1AuthModule } from "./auth";

const AllV1ApiModules = [V1AuthModule, V1PermissionModule, V1RedirectionModule, V1UserModule];

@Module({
    imports: [LoggerModule.forFeature([V1ApiModule]), ...AllV1ApiModules],
    exports: AllV1ApiModules,
})
export class V1ApiModule implements OnModuleInit {
    constructor(@InjectLogger(V1ApiModule) private readonly logger: Logger) {}

    public onModuleInit(): void {
        onBootstrapMessageUtil(V1ApiModule.name, this.logger);
    }
}
