import { IsBoolean, IsDefined, IsString } from "class-validator";
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
        description: "Full destination URL the short link should redirect to.",
        example: "https://www.example.com/some/long/path",
        maxLength: 2048,
    })
    @IsDefined()
    @IsString()
    public targetUrl: string;

    @ApiProperty({
        description:
            "Short route slug used to identify this redirection (e.g. `my-link` in `https://short.ly/my-link`). " +
            "Must be unique within the applicable uniqueness scope.",
        example: "my-link",
        maxLength: 128,
    })
    @IsDefined()
    @IsString()
    public route: string;
}
