import { IsBoolean, IsDefined, IsOptional, IsString, Matches } from "class-validator";
import { Transform } from "class-transformer";
import { toBoolean } from "@libs/utils";

export class CheckRouteAvailabilityQueryDto {
    @IsDefined()
    @IsString()
    @Matches(/^[A-Za-z0-9_-]+$/, {
        message:
            "route may only contain letters (A–Z, a–z), digits (0–9), hyphens (-) and underscores (_).",
    })
    public route: string;

    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public premium?: boolean;
}
