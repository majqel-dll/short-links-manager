import { PermissionEnum } from "./permission.enum";
import { RoleEnum } from "./role.enum";

export const PermissionOnRole: Record<RoleEnum, PermissionEnum[]> = {
    [RoleEnum.NONE]: [],
    [RoleEnum.GUEST]: [
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
        PermissionEnum.MANAGE_OWN_ACCOUNT,
        PermissionEnum.DELETE_OWN_ACCOUNT,
    ],
    [RoleEnum.USER]: [
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.CREATE_PREMIUM_REDIRECTION,
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
        PermissionEnum.MANAGE_OWN_ACCOUNT,
        PermissionEnum.DELETE_OWN_ACCOUNT,
    ],
    [RoleEnum.ADMIN]: [
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.CREATE_PREMIUM_REDIRECTION,
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.READ_OTHER_REDIRECTION,
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
        PermissionEnum.MANAGE_OWN_ACCOUNT,
        PermissionEnum.MANAGE_OTHER_ACCOUNT,
        PermissionEnum.DELETE_OWN_ACCOUNT,
        PermissionEnum.DELETE_OTHER_ACCOUNT,
        PermissionEnum.MANAGE_USERS,
        PermissionEnum.MANAGE_ROLES,
        PermissionEnum.MANAGE_PERMISSIONS,
        PermissionEnum.MANAGE_OTHER_REDIRECTIONS,
        PermissionEnum.MANAGE_OTHER_BASIC_REDIRECTIONS,
        PermissionEnum.MANAGE_OTHER_PREMIUM_REDIRECTIONS,
    ],
}