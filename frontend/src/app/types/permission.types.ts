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

export type RolesResponse = RoleItem[]

export type PermissionsResponse = PermissionItem[];