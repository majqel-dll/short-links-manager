export type ActiveUserPayload = {
    id: number;
    sessionUuid: string;
    createdAt: string;
    roles: string[];
    permissions: string[];
};
