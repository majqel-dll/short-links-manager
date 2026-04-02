import { IsDefined, IsString, IsStrongPassword } from "class-validator";

export class PasswordChangeDto {
    @IsDefined()
    @IsString()
    public oldPassword: string;

    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public newPassword: string;

    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public newPasswordConfirm: string;
}
