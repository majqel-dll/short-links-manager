import { IsBoolean, IsDefined, IsInt, IsOptional, IsString } from "class-validator";
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

    @ApiPropertyOptional({
        description: "New full destination URL.",
        example: "https://www.example.com/new/path",
        maxLength: 2048,
    })
    @IsOptional()
    @IsString()
    public targetUrl?: string;

    @ApiPropertyOptional({
        description:
            "New route slug. Must satisfy uniqueness constraints for the applicable scope.",
        example: "new-slug",
        maxLength: 128,
    })
    @IsOptional()
    @IsString()
    public route?: string;
}
