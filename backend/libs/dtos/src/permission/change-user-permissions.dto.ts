import { ArrayMinSize, IsArray, IsDefined, IsInt, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PermissionOperationDto {
    @ApiProperty({
        description: "Numeric ID of the permission to attach or detach.",
        example: 3,
    })
    @IsDefined()
    @IsInt()
    public permissionId: number;

    @ApiProperty({
        description:
            "Numeric ID of the user to attach the permission to or detach it from.",
        example: 7,
    })
    @IsDefined()
    @IsInt()
    public userId: number;
}

export class ChangeUserPermissionsDto {
    @ApiProperty({
        description:
            "List of user-permission pairs to process. Must contain at least one entry. " +
            "Each entry links one user to one permission.",
        type: [PermissionOperationDto],
        isArray: true,
        minItems: 1,
    })
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => PermissionOperationDto)
    @ValidateNested({ each: true })
    public userToPermissionPairs: PermissionOperationDto[];
}
