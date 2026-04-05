import { DatabaseModule } from "@libs/database";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        DatabaseModule
    ],
    providers: [],
    exports: [],
})
export class GuardsModule { }