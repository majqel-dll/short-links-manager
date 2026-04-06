import { IsDefined, IsEmail, IsString, IsStrongPassword } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignUpDto {

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
    public login: string;

    @ApiProperty({
        description:
            "Account password. Must contain at least 8 characters, including one uppercase letter, " +
            "one lowercase letter, one digit, and one special character.",
        example: "P@ssw0rd!23",
        format: "password",
        minLength: 8,
    })
    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public password: string;

}
