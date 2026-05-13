import { ForbiddenException } from "@nestjs/common";
import { ActiveUserPayload } from "@libs/types";
import { PermissionEnum } from "@libs/enums";

export function hasPermission(
    userId: number | null,
    { id, permissions }: ActiveUserPayload,
    permission: PermissionEnum = PermissionEnum.MANAGE_OTHER_ACCOUNT
): void {

    if (userId && userId !== id && !permissions.includes(permission)) {
        throw new ForbiddenException(`You don't have permission to perform this action.`);
    }

}