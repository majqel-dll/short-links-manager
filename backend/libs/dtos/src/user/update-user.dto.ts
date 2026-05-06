import { IsDefined, IsEmail, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
    @ApiPropertyOptional({
        description: "New unique username. Replaces the current login if provided.",
        example: "john_doe_new",
    })
    @IsOptional()
    @IsString()
    public newLogin: string;

    @ApiPropertyOptional({
        description:
            "New email address. Must be a valid email format and unique across all accounts.",
        example: "new.email@example.com",
        format: "email",
    })
    @IsOptional()
    @IsEmail()
    public newEmail: string;

    @ApiProperty({
        description: "Current account password required to authorise the profile change.",
        example: "P@ssw0rd!23",
        format: "password",
    })
    @IsDefined()
    @IsString()
    public currentPassword: string;
}
