export type ActiveUserPayload = {
    id: number,
    userUuid: string,
    loginAttemptUuid: string,
    createdAt: Date,
    roles: string[],
    permissions: string[],
};