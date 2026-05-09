import { IsDefined, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeleteAccountDto {
    @ApiProperty({
        description: "Account deletion confirmation code received via email.",
        example: "123456789",
    })
    @IsDefined()
    @IsString()
    public code: string;
}
