import { IsBoolean, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { toBoolean } from "@libs/utils";

export class GetUserQueryParamsDto {
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public logs: boolean;

    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public roles: boolean;

    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public redirections: boolean;

    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public permissions: boolean;

    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public requests: boolean;
}
