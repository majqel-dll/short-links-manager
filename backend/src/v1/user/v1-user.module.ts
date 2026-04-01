import { V1UserController } from "./v1-user.controller";
import { V1UserService } from "./v1-user.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [],
    controllers: [V1UserController],
    providers: [V1UserService],
})
export class V1UserModule {}
