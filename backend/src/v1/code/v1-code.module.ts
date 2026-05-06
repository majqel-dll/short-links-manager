import { V1CodeController } from "./v1-code.controller";
import { V1CodeService } from "./v1-code.service";
import { DatabaseModule } from "@libs/database";
import { EmailerModule } from "@libs/emailer";
import { GuardsModule } from "@libs/guards";
import { LoggerModule } from "@libs/logger";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        EmailerModule,
        LoggerModule.forFeature([
            V1CodeController,
            V1CodeService
        ]),
        GuardsModule,
        DatabaseModule,
    ],
    controllers: [V1CodeController],
    providers: [V1CodeService],
    exports: [V1CodeService],
})
export class V1CodeModule { }
