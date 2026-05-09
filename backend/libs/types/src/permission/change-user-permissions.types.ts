import { type ChangeUserPermissionsActionEnum } from "@libs/enums";
import { type PermissionOperationDto } from "@libs/dtos";

export type ChangeUserPermissionsParams = {
    userToPermissionPairs: PermissionOperationDto[];
    action: ChangeUserPermissionsActionEnum;
};
