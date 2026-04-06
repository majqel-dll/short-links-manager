import { IsDefined, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {

    @ApiProperty({
        description: "Username or email address associated with the account.",
        example: "john_doe",
    })
    @IsString()
    @IsDefined()
    public login: string;

    @ApiProperty({
        description: "Account password.",
        example: "P@ssw0rd!23",
        format: "password",
    })
    @IsString()
    @IsDefined()
    public password: string;

}
