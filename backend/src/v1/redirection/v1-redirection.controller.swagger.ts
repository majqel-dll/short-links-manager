import {
    type ApiOperationOptions,
    type ApiResponseOptions,
    type ApiParamOptions,
    type ApiQueryOptions,
} from "@nestjs/swagger";

const RedirectionSchema = {
    type: "object",
    properties: {
        id: { type: "number", example: 42 },
        createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-01-01T00:00:00.000Z",
        },
        updatedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null,
        },
        targetUrl: {
            type: "string",
            example: "https://www.example.com/some/long/path",
        },
        route: { type: "string", example: "my-link" },
        isPremium: { type: "boolean", example: false },
        category: { type: "string", nullable: true, example: null },
        userId: { type: "number", example: 1 },
    },
} as const;

export const GetRedirectionsOperation: ApiOperationOptions = {
    summary: "List own redirections",
    description:
        "Returns a paginated list of redirections belonging to the authenticated user. " +
        "Accepts optional take and skip query parameters for pagination. " +
        "Requires the **READ_OWN_REDIRECTION** or **READ_OTHER_REDIRECTION** permission.",
};

export const GetRedirectionsOkResponse: ApiResponseOptions = {
    description: "Redirections retrieved successfully.",
    schema: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: RedirectionSchema,
            },
            meta: {
                type: "object",
                properties: {
                    totalRecords: { type: "number", example: 25 },
                    currentPage: { type: "number", example: 0 },
                    pageSize: { type: "number", example: 10 },
                    totalPages: { type: "number", example: 3 },
                },
            },
        },
    },
};

export const GetRedirectionByIdOperation: ApiOperationOptions = {
    summary: "Get redirection by ID",
    description:
        "Returns a single redirection identified by its numeric ID. " +
        "Accessing your own redirection requires **READ_OWN_REDIRECTION**; " +
        "accessing another user's redirection additionally requires **READ_OTHER_REDIRECTION**.",
};

export const GetRedirectionByIdOkResponse: ApiResponseOptions = {
    description: "Redirection retrieved successfully.",
    schema: RedirectionSchema,
};

export const GetRedirectionByIdRedirectionIdParam: ApiParamOptions = {
    name: "redirectionId",
    description: "Numeric ID of the redirection to retrieve.",
    example: 42,
};

export const CreateRedirectionOperation: ApiOperationOptions = {
    summary: "Create redirection",
    description:
        "Creates a new short-link redirection for the authenticated user. " +
        "Creating a basic redirection requires the **CREATE_BASIC_REDIRECTION** permission. " +
        "Setting isPremium = true additionally requires the **CREATE_PREMIUM_REDIRECTION** permission. " +
        "Premium routes are globally unique across all users; " +
        "non-premium routes are unique per user (two different users may share the same route).",
};

export const CreateRedirectionCreatedResponse: ApiResponseOptions = {
    description: "Redirection created successfully.",
    schema: RedirectionSchema,
};

export const UpdateRedirectionOperation: ApiOperationOptions = {
    summary: "Update redirection",
    description:
        "Updates an existing redirection identified by the redirectionId field in the request body. " +
        "Both route and targetUrl are required; isPremium is optional and defaults to the current value if omitted. " +
        "Changing isPremium to true additionally requires the **CREATE_PREMIUM_REDIRECTION** permission. " +
        "Requires the **MANAGE_OWN_BASIC_REDIRECTION** or **MANAGE_OWN_PREMIUM_REDIRECTION** permission for own redirections; " +
        "updating another user's redirection additionally requires **MANAGE_OTHER_REDIRECTIONS**.",
};

export const UpdateRedirectionOkResponse: ApiResponseOptions = {
    description: "Redirection updated successfully.",
    schema: RedirectionSchema,
};

export const UpdateRedirectionConflictResponse: ApiResponseOptions = {
    description:
        "A redirection with the specified route already exists. " +
        "Premium routes must be globally unique; non-premium routes must be unique per user.",
};

export const DeleteRedirectionOperation: ApiOperationOptions = {
    summary: "Delete redirection",
    description:
        "Permanently deletes a redirection identified by its numeric ID. " +
        "Requires the **MANAGE_OWN_BASIC_REDIRECTION** or **MANAGE_OWN_PREMIUM_REDIRECTION** permission for own redirections. " +
        "Deleting another user's redirection additionally requires the **MANAGE_OTHER_REDIRECTIONS** permission.",
};

export const DeleteRedirectionNoContentResponse: ApiResponseOptions = {
    description: "Redirection deleted successfully.",
};

export const DeleteRedirectionRedirectionIdParam: ApiParamOptions = {
    name: "redirectionId",
    description: "Numeric ID of the redirection to delete.",
    example: 42,
};

export const RedirectClientToOperation: ApiOperationOptions = {
    summary: "Resolve short link",
    description:
        "Resolves a route slug to its target URL and performs a 302 redirect. " +
        "Resolved routes are served from an in-memory cache when available; on a cache miss the lookup falls back to the database. " +
        "If the route does not exist or is reserved (favicon.ico, not-found), " +
        "the client is redirected to the frontend not-found page at /panel/redirection/not-found?r={route}. " +
        "This endpoint is public and does not require authentication.",
};

export const RedirectClientToFoundResponse: ApiResponseOptions = {
    description:
        "Route resolved — redirecting to the target URL. " +
        "An unrecognised or reserved route also returns 302, redirecting to /panel/redirection/not-found.",
};

export const RedirectClientToRouteParam: ApiParamOptions = {
    name: "route",
    description: "The short-link route slug to resolve.",
    example: "my-link",
};

export const CommonRedirectionUnauthorizedResponse: ApiResponseOptions = {
    description: "Missing, expired, or invalid authentication token.",
};

export const CommonRedirectionForbiddenResponse: ApiResponseOptions = {
    description:
        "Account is not yet activated, has been blocked, or does not have the required permission to perform this action.",
};

export const CommonRedirectionInternalServerErrorResponse: ApiResponseOptions = {
    description: "An unexpected error occurred. Please try again later.",
};

export const TakeQuery: ApiQueryOptions = {
    name: "take",
    required: false,
    type: Number,
    description: "Maximum number of records to return.",
    example: 10,
};

export const SkipQuery: ApiQueryOptions = {
    name: "skip",
    required: false,
    type: Number,
    description: "Number of records to skip (zero-based offset for pagination).",
    example: 0,
};
