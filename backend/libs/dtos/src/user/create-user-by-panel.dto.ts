import {
    IsDefined,
    IsEmail,
    IsOptional,
    IsString,
    IsStrongPassword,
    Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserByPanelDto {
    @ApiProperty({
        description:
            "User's email address. Must be a valid email format and unique across all accounts.",
        example: "john.doe@example.com",
        format: "email",
    })
    @IsDefined()
    @IsEmail()
    @IsString()
    public email: string;

    @ApiProperty({
        description: "Unique username used for authentication and public identification.",
        example: "john_doe",
        minLength: 1,
    })
    @IsDefined()
    @IsString()
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: "Login can only contain letters, numbers, and underscores.",
    })
    public login: string;

    @ApiPropertyOptional({
        description:
            "Account password. Must contain at least 8 characters, including one uppercase letter, " +
            "one lowercase letter, one digit, and one special character. " +
            "If omitted, the account is created without a password.",
        example: "P@ssw0rd!23",
        format: "password",
        required: false,
        minLength: 8,
    })
    @IsOptional()
    @IsString()
    @IsStrongPassword()
    public password?: string;
}
