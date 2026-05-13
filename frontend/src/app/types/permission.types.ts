export type PermissionItem = {
    id: number,
    createdAt: string,
    value: string,
}
export type RoleItem = {
    id: number,
    createdAt: string,
    name: string,
}

export type RolesResponse = {
    data: RoleItem[],
}

export type PermissionsResponse = {
    data: PermissionItem[],
}