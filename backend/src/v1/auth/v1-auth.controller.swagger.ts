import {
    type ApiOperationOptions,
    type ApiResponseOptions,
    type ApiParamOptions,
} from "@nestjs/swagger";

const TokenPairSchema = {
    type: "object",
    properties: {
        accessToken: {
            type: "object",
            properties: {
                value: {
                    type: "string",
                    description: "Signed JWT access token. Valid for 15 minutes.",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                expiresIn: {
                    type: "string",
                    description: "Validity duration of the access token.",
                    example: "15m",
                },
            },
        },
        refreshToken: {
            type: "object",
            properties: {
                value: {
                    type: "string",
                    description: "Signed JWT refresh token. Valid for 7 days.",
                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                expiresIn: {
                    type: "string",
                    description: "Validity duration of the refresh token.",
                    example: "7d",
                },
            },
        },
    },
} as const;

const MessageSchema = (example: string) =>
    ({
        type: "object",
        properties: {
            message: { type: "string", example },
        },
    }) as const;

export const GetSessionsOperation: ApiOperationOptions = {
    summary: "List active sessions",
    description:
        "Returns all currently active sessions for the authenticated user. " +
        "Accepts either a Bearer token in the Authorization header or an accessToken cookie. " +
        "Sensitive fields (session UUID, user ID, login attempt UUID) are excluded from the response.",
};

export const GetSessionsOkResponse: ApiResponseOptions = {
    description: "Active sessions retrieved successfully.",
    schema: {
        type: "array",
        items: {
            type: "object",
            properties: {
                id: { type: "number", example: 42 },
                isActive: { type: "boolean", example: true },
                expiresAt: {
                    type: "string",
                    format: "date-time",
                    example: "2026-04-13T12:00:00.000Z",
                },
                createdAt: {
                    type: "string",
                    format: "date-time",
                    example: "2026-04-06T12:00:00.000Z",
                },
                updatedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                    example: null,
                },
            },
        },
    },
};

export const SignInOperation: ApiOperationOptions = {
    summary: "Sign in",
    description:
        "Authenticates a user with their login (or email) and password. " +
        "On success, returns a new access/refresh token pair in the response body and " +
        "additionally sets the access token as an httpOnly, secure, SameSite=Strict cookie named accessToken.",
};

export const SignInAcceptedResponse: ApiResponseOptions = {
    description:
        "Authentication successful. Token pair returned in the response body. " +
        "The accessToken value is also set as an httpOnly cookie.",
    schema: TokenPairSchema,
};

export const SignInUnauthorizedResponse: ApiResponseOptions = {
    description: "Invalid login or password, or account has been blocked.",
};

export const SignUpOperation: ApiOperationOptions = {
    summary: "Sign up",
    description:
        "Registers a new user account with the provided email, login, and password. " +
        "The newly created account is inactive until explicitly approved by an administrator. " +
        "A default guest role with basic permissions is assigned automatically.",
};

export const SignUpCreatedResponse: ApiResponseOptions = {
    description:
        "Account created successfully. The account is pending administrator activation.",
    schema: MessageSchema(
        "Account created successfully, and now is waiting for activation.",
    ),
};

export const SignUpConflictResponse: ApiResponseOptions = {
    description: "An account with the provided login or email already exists.",
};

export const SignOutOperation: ApiOperationOptions = {
    summary: "Sign out",
    description:
        "Terminates the session associated with the token used in this request. " +
        "After a successful sign-out the token is no longer valid for further requests.",
};

export const SignOutOkResponse: ApiResponseOptions = {
    description: "Current session terminated successfully.",
    schema: MessageSchema("Current session terminated successfully."),
};

export const SignOutNotFoundResponse: ApiResponseOptions = {
    description: "The active session associated with the provided token was not found.",
};

export const SignOutAllOperation: ApiOperationOptions = {
    summary: "Sign out of all sessions",
    description:
        "Terminates all active sessions belonging to the authenticated user, " +
        "including the one used to make this request.",
};

export const SignOutAllOkResponse: ApiResponseOptions = {
    description: "All active sessions terminated successfully.",
    schema: MessageSchema("All sessions terminated successfully."),
};

export const SignOutSessionOperation: ApiOperationOptions = {
    summary: "Sign out of a specific session",
    description:
        "Terminates a specific session identified by its UUID. " +
        "The session must belong to the authenticated user.",
};

export const SignOutSessionUuidParam: ApiParamOptions = {
    name: "sessionUuid",
    description: "UUID of the session to terminate.",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
};

export const SignOutSessionOkResponse: ApiResponseOptions = {
    description: "Specified session terminated successfully.",
    schema: MessageSchema(
        "Specified session a1b2c3d4-e5f6-7890-abcd-ef1234567890 terminated successfully.",
    ),
};

export const SignOutSessionNotFoundResponse: ApiResponseOptions = {
    description:
        "The specified session was not found or does not belong to the authenticated user.",
};

export const ChangePasswordOperation: ApiOperationOptions = {
    summary: "Change password",
    description:
        "Changes the password for the authenticated user's account. " +
        "The current password is required for identity verification. " +
        "On success, all existing active sessions are invalidated — the user must sign in again on all devices.",
};

export const ChangePasswordAcceptedResponse: ApiResponseOptions = {
    description:
        "Password changed successfully. All active sessions have been invalidated.",
};

export const ChangePasswordBadRequestResponse: ApiResponseOptions = {
    description: "newPassword and newPasswordConfirm do not match.",
};

export const ChangePasswordUnauthorizedResponse: ApiResponseOptions = {
    description:
        "Missing or invalid authentication token, or the provided current password is incorrect.",
};

export const ChangePasswordForbiddenResponse: ApiResponseOptions = {
    description: "Account is not yet activated by an administrator, or has been blocked.",
};

export const RefreshTokenOperation: ApiOperationOptions = {
    summary: "Refresh access token",
    description:
        "Issues a new access/refresh token pair using a valid, non-expired refresh token. " +
        "The supplied refresh token is rotated — it is invalidated and a fresh one is returned together with a new access token. " +
        "If the same refresh token is reused after rotation (replay attack), " +
        "the compromised session is terminated immediately and a 403 Forbidden response is returned. " +
        "The new access token is also set as an httpOnly cookie, mirroring the sign-in behaviour.",
};

export const RefreshTokenOkResponse: ApiResponseOptions = {
    description:
        "New token pair issued successfully. " +
        "The accessToken value is also set as an httpOnly cookie.",
    schema: TokenPairSchema,
};

export const RefreshTokenBadRequestResponse: ApiResponseOptions = {
    description:
        "The provided refresh token is malformed or the associated session no longer exists.",
};

export const RefreshTokenForbiddenResponse: ApiResponseOptions = {
    description:
        "The refresh token has expired, the account is banned, or token reuse was detected (session has been terminated).",
};

export const CommonUnauthorizedResponse: ApiResponseOptions = {
    description: "Missing, expired, or invalid authentication token.",
};

export const CommonInternalServerErrorResponse: ApiResponseOptions = {
    description: "An unexpected error occurred. Please try again later.",
};

export const RequestPasswordResetOperation: ApiOperationOptions = {
    summary: "Request password reset",
    description:
        "Initiates the password reset flow for the account identified by the provided login or email address. " +
        "If the account exists and is not blocked, a one-time reset code is sent to the associated email address. " +
        "To prevent user enumeration, the endpoint always returns 202 Accepted regardless of whether the account exists.",
};

export const RequestPasswordResetAcceptedResponse: ApiResponseOptions = {
    description:
        "Request accepted. If the account exists, a reset code has been dispatched to the registered email address.",
    schema: MessageSchema("Check your email for the password reset instructions."),
};

export const ConfirmPasswordResetOperation: ApiOperationOptions = {
    summary: "Confirm password reset",
    description:
        "Completes the password reset flow by verifying the one-time reset code and updating the account password. " +
        "The code must be valid, unused, and not expired. " +
        "On success, all active sessions belonging to the account are immediately invalidated — the user must sign in again on all devices.",
};

export const ConfirmPasswordResetAcceptedResponse: ApiResponseOptions = {
    description: "Password reset successfully. All active sessions have been invalidated.",
    schema: MessageSchema("Your password has been reset successfully."),
};

export const ConfirmPasswordResetBadRequestResponse: ApiResponseOptions = {
    description:
        "newPassword and newPasswordConfirm do not match, the reset code is invalid, has already been used, or has expired.",
};
