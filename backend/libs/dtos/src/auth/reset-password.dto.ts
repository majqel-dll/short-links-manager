import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsString, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {

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

    @ApiProperty({
        description:
            "One-time password reset key received via the selected delivery method. " +
            "The key expires after a short period of time.",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    })
    @IsDefined()
    @IsString()
    public key: string;

}
