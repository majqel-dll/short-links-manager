import { RoleEnum } from "@libs/enums";
import { IsDefined, IsEnum, IsInt } from "class-validator";

export class ChangeRoleDto {
    @IsDefined()
    @IsEnum(RoleEnum)
    public role: RoleEnum;

    @IsDefined()
    @IsInt()
    public userId: number;
}
