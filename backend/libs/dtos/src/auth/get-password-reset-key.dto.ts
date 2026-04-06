import { IsDefined, IsEnum, IsString } from "class-validator";
import { PasswordResetEnum } from "@libs/enums";
import { ApiProperty } from "@nestjs/swagger";

export class GetPasswordResetKeyDto {
    @ApiProperty({
        description:
            "Username or email address of the account for which the password reset key should be generated.",
        example: "john_doe",
    })
    @IsDefined()
    @IsString()
    public login: string;

    @ApiProperty({
        description:
            "Delivery method for the password reset key. " +
            "`email` sends the key to the registered email address; " +
            "`login` uses the username-based delivery channel.",
        enum: PasswordResetEnum,
        enumName: "PasswordResetEnum",
        example: PasswordResetEnum.EMAIL,
    })
    @IsDefined()
    @IsEnum(PasswordResetEnum)
    public method: PasswordResetEnum;
}
