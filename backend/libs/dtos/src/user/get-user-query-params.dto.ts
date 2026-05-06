import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { toBoolean } from "@libs/utils";

export class GetUserQueryParamsDto {
    @ApiPropertyOptional({
        description: "Include the user's activity logs in the response.",
        example: false,
    })
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public logs: boolean;

    @ApiPropertyOptional({
        description: "Include the user's assigned roles (with nested permissions) in the response.",
        example: false,
    })
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public roles: boolean;

    @ApiPropertyOptional({
        description: "Include the user's owned redirections in the response.",
        example: false,
    })
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public redirections: boolean;

    @ApiPropertyOptional({
        description: "Include the user's directly assigned permissions in the response.",
        example: false,
    })
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public permissions: boolean;

    @ApiPropertyOptional({
        description: "Include the user's HTTP request history in the response.",
        example: false,
    })
    @IsOptional()
    @Transform(toBoolean)
    @IsBoolean()
    public requests: boolean;
}
