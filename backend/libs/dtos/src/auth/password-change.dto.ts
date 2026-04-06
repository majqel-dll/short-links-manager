import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsString, IsStrongPassword } from "class-validator";

export class PasswordChangeDto {
    @ApiProperty({
        description:
            "Current account password used to verify identity before making the change.",
        example: "OldP@ssw0rd!23",
        format: "password",
    })
    @IsDefined()
    @IsString()
    public oldPassword: string;

    @ApiProperty({
        description:
            "New password to set for the account. Must contain at least 8 characters, " +
            "including one uppercase letter, one lowercase letter, one digit, and one special character.",
        example: "NewP@ssw0rd!99",
        format: "password",
        minLength: 8,
    })
    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public newPassword: string;

    @ApiProperty({
        description:
            "Confirmation of the new password. Must be identical to `newPassword`.",
        example: "NewP@ssw0rd!99",
        format: "password",
        minLength: 8,
    })
    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public newPasswordConfirm: string;
}
