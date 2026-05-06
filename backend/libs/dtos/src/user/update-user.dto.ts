import { IsDefined, IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    public newLogin: string;

    @IsOptional()
    @IsEmail()
    public newEmail: string;

    @IsDefined()
    @IsString()
    public currentPassword: string;
}
