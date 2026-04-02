import { IsDefined, IsString } from "class-validator";
export class SignInDto {

    @IsString()
    @IsDefined()
    public login: string;

    @IsString()
    @IsDefined()
    public password: string;

}