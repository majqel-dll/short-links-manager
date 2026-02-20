import { V1CodeController } from "./v1-code.controller";
import { V1CodeService } from "./v1-code.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [],
    controllers: [
        V1CodeController
    ],
    providers: [
        V1CodeService
    ]
})

export class V1CodeModule { }