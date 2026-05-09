import { IsDefined, IsEnum, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RoleEnum } from "@libs/enums";

export class ChangeRoleDto {
    @ApiProperty({
        description: "Role to assign to the user.",
        enum: RoleEnum,
        enumName: "RoleEnum",
        example: RoleEnum.USER,
    })
    @IsDefined()
    @IsEnum(RoleEnum)
    public role: RoleEnum;

    @ApiProperty({
        description: "Numeric ID of the user whose role is being changed.",
        example: 7,
    })
    @IsDefined()
    @IsInt()
    public userId: number;
}
