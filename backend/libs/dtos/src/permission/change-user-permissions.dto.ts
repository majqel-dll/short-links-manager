import { ArrayMinSize, IsArray, IsDefined, IsInt, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ChangeUserPermissionsDto {
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => PermissionOperationDto)
    @ValidateNested({ each: true })
    public userToPermissionPairs: PermissionOperationDto[];
}

export class PermissionOperationDto {
    @IsDefined()
    @IsInt()
    public permissionId: number;

    @IsDefined()
    @IsInt()
    public userId: number;
}
