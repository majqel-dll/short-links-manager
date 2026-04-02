import { IsDefined, IsEnum, IsString } from "class-validator";
import { PasswordResetEnum } from "@libs/enums";

export class GetPasswordResetKeyDto {

    @IsDefined()
    @IsString()
    public login: string;

    @IsDefined()
    @IsEnum(PasswordResetEnum)
    public method: PasswordResetEnum;

}