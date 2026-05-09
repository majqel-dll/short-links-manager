import { IsDefined, IsString } from "class-validator";
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
}
