import { IsDefined, IsString, Matches } from "class-validator";

export class CheckRouteAvailabilityDto {
    @IsDefined()
    @IsString()
    @Matches(/^[A-Za-z0-9_-]+$/, {
        message:
            "route may only contain letters (A–Z, a–z), digits (0–9), hyphens (-) and underscores (_).",
    })
    public route: string;
}
