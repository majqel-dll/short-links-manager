import { IsDefined, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
    @ApiProperty({
        description:
            "A valid refresh token issued during the previous sign-in. " +
            "Used to obtain a new access token without re-authenticating.",
        example:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
    })
    @IsDefined()
    @IsString()
    public refreshToken: string;
}
