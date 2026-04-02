import { IsDefined, IsString, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {

    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public newPassword: string;

    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public newPasswordConfirm: string;

    @IsDefined()
    @IsString()
    public key: string;

};