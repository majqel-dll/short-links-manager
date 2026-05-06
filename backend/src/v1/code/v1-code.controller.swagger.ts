import {
    type ApiOperationOptions,
    type ApiResponseOptions,
    type ApiParamOptions,
} from "@nestjs/swagger";

const CodeActionEnumValues: string[] = [
    "RESET_PASSWORD_REQUEST",
    "RESET_PASSWORD_CONFIRM",
    "VERIFY_EMAIL",
    "DELETE_ACCOUNT_CONFIRM",
];

const MessageSchema = (example: string) =>
    ({
        type: "object",
        properties: {
            message: { type: "string", example },
        },
    }) as const;

const RedirectResponseSchema = {
    type: "object",
    properties: {
        url: {
            type: "string",
            example: "https://example.com/panel/account",
        },
        status: {
            type: "number",
            example: 202,
        },
    },
} as const;

const CodeEntitySchema = {
    type: "object",
    properties: {
        id: { type: "number", example: 120 },
        action: {
            type: "string",
            enum: CodeActionEnumValues,
            example: "VERIFY_EMAIL",
        },
        usedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null,
        },
        expiresAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-05-04T10:30:00.000Z",
        },
        createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-05-01T10:30:00.000Z",
        },
    },
} as const;

export const GetActiveCodesForUserOperation: ApiOperationOptions = {
    summary: "List active codes for authenticated user",
    description:
        "Returns active (unused, non-expired) codes for the authenticated user, " +
        "filtered by the action type provided as a route parameter.",
};

export const GetActiveCodesForUserIdParam: ApiParamOptions = {
    name: "action",
    description: "Code action type to filter by.",
    enum: CodeActionEnumValues,
    example: "VERIFY_EMAIL",
};

export const GetActiveCodesForUserOkResponse: ApiResponseOptions = {
    description: "Active codes retrieved successfully.",
    schema: {
        type: "array",
        items: CodeEntitySchema,
    },
};

export const ConfirmUserByActivationCodeOperation: ApiOperationOptions = {
    summary: "Confirm user with activation code",
    description:
        "Marks a verification code as used, activates the related account, and returns a redirect payload.",
};

export const ConfirmUserByActivationCodeParam: ApiParamOptions = {
    name: "code",
    description: "Verification code used to activate the account.",
    example: "004120987",
};

export const ConfirmUserByActivationCodeAcceptedResponse: ApiResponseOptions = {
    description: "Account activated successfully and redirect returned.",
    schema: RedirectResponseSchema,
};

export const SendVerificationCodeToEmailOperation: ApiOperationOptions = {
    summary: "Send verification code",
    description:
        "Generates and sends a new email verification code to the authenticated user. " +
        "If a valid code was already sent within the last 3 minutes, the request is throttled.",
};

export const SendVerificationCodeToEmailOkResponse: ApiResponseOptions = {
    description: "Verification code sent successfully.",
    schema: MessageSchema("Verification code sent successfully."),
};

export const CommonCodeBadRequestResponse: ApiResponseOptions = {
    description: "Invalid or expired activation code.",
};

export const CommonCodeUnauthorizedResponse: ApiResponseOptions = {
    description: "Missing, expired, or invalid authentication token.",
};

export const CommonCodeForbiddenResponse: ApiResponseOptions = {
    description:
        "Account is not yet activated, has been blocked, or does not have permission for this action.",
};

export const CommonCodeTooManyRequestsResponse: ApiResponseOptions = {
    description:
        "A verification code was already sent recently. Please wait before requesting another one.",
};

export const CommonCodeInternalServerErrorResponse: ApiResponseOptions = {
    description: "An unexpected error occurred. Please try again later.",
};
