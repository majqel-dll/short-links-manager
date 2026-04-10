import { PermissionEnum } from "@libs/enums";

export type ActiveUserPayload = {
    id: number;
    sessionUuid: string;
    createdAt: string;
    roles: string[];
    permissions: PermissionEnum[];
};
