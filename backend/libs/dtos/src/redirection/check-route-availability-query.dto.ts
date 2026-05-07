import { IsBoolean, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { toBoolean } from "@libs/utils";

export class CheckRouteAvailabilityQueryDto {
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public premium?: boolean;
}
