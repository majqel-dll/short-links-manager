import { IsDefined, IsEmail, IsString, IsStrongPassword } from "class-validator";

export class SignUpDto {
    @IsDefined()
    @IsEmail()
    @IsString()
    public email: string;

    @IsDefined()
    @IsString()
    public login: string;

    @IsDefined()
    @IsString()
    @IsStrongPassword()
    public password: string;
}
