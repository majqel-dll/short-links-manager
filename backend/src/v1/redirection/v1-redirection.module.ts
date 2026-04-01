import { V1RedirectionController } from "./v1-redirection.controller";
import { V1RedirectionService } from "./v1-redirection.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [],
    controllers: [V1RedirectionController],
    providers: [V1RedirectionService],
})
export class V1RedirectionModule {}
