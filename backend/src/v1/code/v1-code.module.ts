import { DatabaseModule } from "@libs/database";
import { V1CodeController } from "./v1-code.controller";
import { V1CodeService } from "./v1-code.service";
import { EmailerModule } from "@libs/emailer";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        EmailerModule,
        DatabaseModule,
    ],
    controllers: [V1CodeController],
    providers: [V1CodeService],
})
export class V1CodeModule { }
