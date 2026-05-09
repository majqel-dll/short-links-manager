import {
    IsBoolean,
    IsDefined,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateRedirectionDto {
    @ApiProperty({
        description: "Numeric ID of the redirection to update.",
        example: 42,
    })
    @IsDefined()
    @IsInt()
    public redirectionId: number;

    @ApiPropertyOptional({
        description:
            "Change the premium flag of the redirection. " +
            "Switching to `true` requires the CREATE_PREMIUM_REDIRECTION permission.",
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    public isPremium?: boolean;

    @ApiProperty({
        description:
            "Full destination URL the short link should redirect to. Must use the HTTPS protocol.",
        example: "https://www.example.com/some/long/path",
        maxLength: 2048,
    })
    @IsDefined()
    @IsUrl({
        require_protocol: true,
        require_tld: process.env.NODE_ENV === `PRODUCTION`,
        protocols: process.env.NODE_ENV === `PRODUCTION` ? [`https`] : [`http`, `https`],
    })
    @IsString()
    public targetUrl: string;

    @ApiProperty({
        description:
            "Short route slug used to identify this redirection (e.g. `my-link` in `https://short.ly/my-link`). " +
            "Must be unique within the applicable uniqueness scope. " +
            "Allowed characters: letters (A–Z, a–z), digits (0–9), hyphens (-) and underscores (_).",
        example: "my-link",
        pattern: "^[A-Za-z0-9_-]+$",
        maxLength: 128,
    })
    @IsDefined()
    @IsString()
    @Matches(/^[A-Za-z0-9_-]+$/, {
        message:
            "route may only contain letters (A–Z, a–z), digits (0–9), hyphens (-) and underscores (_).",
    })
    public route: string;
}
