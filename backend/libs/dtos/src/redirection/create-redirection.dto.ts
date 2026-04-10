import { IsBoolean, IsDefined, IsString, IsUrl, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRedirectionDto {
    @ApiProperty({
        description:
            "Whether this is a premium redirection. " +
            "Premium routes are globally unique across all users and require the CREATE_PREMIUM_REDIRECTION permission. " +
            "Non-premium routes are unique per user.",
        example: false,
    })
    @IsDefined()
    @IsBoolean()
    public isPremium: boolean;

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
