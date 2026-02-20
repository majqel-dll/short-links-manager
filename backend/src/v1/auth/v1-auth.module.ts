import { V1AuthController } from "./v1-auth.controller";
import { V1AuthService } from "./v1-auth.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [
        V1AuthController
    ],
    providers: [
        V1AuthService
    ]
})
export class V1AuthModule { }