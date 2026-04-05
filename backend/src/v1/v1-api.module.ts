import { V1RedirectionModule } from "./redirection";
import { V1PermissionModule } from "./permission";
import { Module } from "@nestjs/common";
import { V1UserModule } from "./user";
import { V1AuthModule } from "./auth";
import { V1CodeModule } from "./code";

const AllV1ApiModules = [
    V1AuthModule,
    V1CodeModule,
    V1PermissionModule,
    V1RedirectionModule,
    V1UserModule,
];

@Module({
    imports: AllV1ApiModules,
    exports: AllV1ApiModules,
})
export class V1ApiModule { }
