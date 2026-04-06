export type RefreshTokenPayload = {
    expiringAt: string;
    sessionUuid: string;
    loginAttemptUuid: string;
    createdAt: string;
    userId: number;
};
