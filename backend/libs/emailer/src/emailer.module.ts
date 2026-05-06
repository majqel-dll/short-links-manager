import { Module } from "@nestjs/common";
import { EmailerService } from "./emailer.service";
import { LoggerModule } from "@libs/logger";

@Module({
    imports: [LoggerModule.forFeature([EmailerService])],
    providers: [EmailerService],
    exports: [EmailerService],
})
export class EmailerModule {}
