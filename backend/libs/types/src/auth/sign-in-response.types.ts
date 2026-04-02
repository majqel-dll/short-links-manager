export type SignInResponse = {
    accessToken: {
        expiresIn: string;
        value: string;
    };
    refreshToken: {
        expiresIn: string;
        value: string;
    };
};
