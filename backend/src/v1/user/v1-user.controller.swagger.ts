import {
    type ApiOperationOptions,
    type ApiResponseOptions,
    type ApiParamOptions,
    type ApiBodyOptions,
    type ApiQueryOptions,
} from "@nestjs/swagger";

const BasicEntitySchema = {
    id: { type: "number", example: 1 },
    createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-01-15T10:30:00.000Z",
    },
    updatedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
        example: null,
    },
} as const;

const UserSchema = {
    type: "object",
    properties: {
        ...BasicEntitySchema,
        uuid: {
            type: "string",
            format: "uuid",
            example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        },
        email: {
            type: "string",
            format: "email",
            nullable: true,
            example: "john.doe@example.com",
        },
        login: { type: "string", example: "john.doe" },
        blockedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null,
        },
        activatedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-01-15T10:30:00.000Z",
        },
    },
} as const;

const PermissionSchema = {
    type: "object",
    properties: {
        ...BasicEntitySchema,
        value: { type: "string", example: "MANAGE_OWN_ACCOUNT" },
    },
} as const;

const RoleSchema = {
    type: "object",
    properties: {
        ...BasicEntitySchema,
        name: { type: "string", example: "guest" },
        permissions: {
            type: "array",
            items: PermissionSchema,
        },
    },
} as const;

const RedirectionSchema = {
    type: "object",
    properties: {
        ...BasicEntitySchema,
        targetUrl: {
            type: "string",
            format: "uri",
            example: "https://www.example.com/very/long/url",
        },
        route: { type: "string", example: "my-link" },
        isPremium: { type: "boolean", example: false },
        category: {
            type: "string",
            nullable: true,
            example: "marketing",
        },
        userId: { type: "number", example: 1 },
    },
} as const;

const PaginationMetaSchema = {
    type: "object",
    properties: {
        totalRecords: {
            type: "number",
            description: "Total number of records matching the query.",
            example: 42,
        },
        currentPage: {
            type: "number",
            description: "Zero-based offset of the current page.",
            example: 0,
        },
        pageSize: {
            type: "number",
            description: "Number of records returned in the current response.",
            example: 10,
        },
        totalPages: {
            type: "number",
            description: "Total number of pages given the current page size.",
            example: 5,
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

export const UserIdParam: ApiParamOptions = {
    name: "userId",
    description: "Numeric identifier of the target user.",
    example: 1,
};

export const DeleteAccountCodeParam: ApiParamOptions = {
    name: "code",
    description: "Account deletion confirmation code sent to the account email.",
    example: "123456789",
};

export const RequestAccountDeletionOperation: ApiOperationOptions = {
    summary: "Request own account deletion",
    description:
        "Sends an account deletion confirmation code to the authenticated user's email address. " +
        "Requires the **DELETE_OWN_ACCOUNT** permission.",
};

export const RequestAccountDeletionAcceptedResponse: ApiResponseOptions = {
    description: "Account deletion confirmation code sent successfully.",
    schema: MessageSchema(
        "Account deletion code has been sent to your email to confirm your account deletion.",
    ),
};

export const GetUsersOperation: ApiOperationOptions = {
    summary: "List all users",
    description:
        "Returns a paginated list of all registered user accounts. " +
        "Supports optional take and skip query parameters for pagination. " +
        "Requires the **MANAGE_OTHER_ACCOUNT** permission. " +
        "Sensitive fields (passwordHash, lastPasswordChange, lastLoginAt) are excluded from every response.",
};

export const GetUsersOkResponse: ApiResponseOptions = {
    description: "User list retrieved successfully.",
    schema: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: UserSchema,
            },
            meta: PaginationMetaSchema,
        },
    },
};

export const GetUsersForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user does not have the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const GetUserByIdOperation: ApiOperationOptions = {
    summary: "Get user by ID",
    description:
        "Returns the profile of the user identified by userId. " +
        "Use the optional boolean query parameters (roles, permissions, redirections, logs, requests) " +
        "to include related data in the response. " +
        "Users with the **MANAGE_OWN_ACCOUNT** permission may only access their own profile. " +
        "Users with the **MANAGE_OTHER_ACCOUNT** permission may access any profile.",
};

export const GetUserByIdOkResponse: ApiResponseOptions = {
    description: "User profile retrieved successfully.",
    schema: {
        ...UserSchema,
        properties: {
            ...UserSchema.properties,
            roles: {
                type: "array",
                nullable: true,
                items: RoleSchema,
            },
            permissions: {
                type: "array",
                nullable: true,
                items: PermissionSchema,
            },
            redirections: {
                type: "array",
                nullable: true,
                items: RedirectionSchema,
            },
        },
    },
};

export const GetUserByIdForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is requesting another user's profile without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const GetUserByIdNotFoundResponse: ApiResponseOptions = {
    description: "No user with the given userId exists.",
};

export const ChangeUserDataOperation: ApiOperationOptions = {
    summary: "Update user profile",
    description:
        "Partially updates the profile data of the user identified by userId. " +
        "Users with the **MANAGE_OWN_ACCOUNT** permission may only modify their own profile. " +
        "Users with the **MANAGE_OTHER_ACCOUNT** permission may modify any profile.",
};

export const ChangeUserDataAcceptedResponse: ApiResponseOptions = {
    description: "User profile updated successfully.",
};

export const ChangeUserDataForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is modifying another user's profile without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const ChangeUserDataNotFoundResponse: ApiResponseOptions = {
    description: "No user with the given userId exists.",
};

export const DeleteAccountOperation: ApiOperationOptions = {
    summary: "Delete user account",
    description:
        "Permanently deletes the authenticated user's account after confirming a valid deletion code, " +
        "along with all associated data (sessions, redirections, codes, logs). " +
        "Requires the **DELETE_OWN_ACCOUNT** permission. " +
        "This action is irreversible.",
};

export const DeleteAccountNoContentResponse: ApiResponseOptions = {
    description: "Account deleted successfully.",
};

export const DeleteAccountForbiddenResponse: ApiResponseOptions = {
    description:
        "Account is not yet activated, has been blocked, or does not have the **DELETE_OWN_ACCOUNT** permission.",
};

export const DeleteAccountNotFoundResponse: ApiResponseOptions = {
    description: "No user with the given userId exists.",
};

export const ConfirmDeleteAccountOperation: ApiOperationOptions = {
    summary: "Confirm own account deletion by code",
    description:
        "Confirms account deletion using a valid code from email and deletes the authenticated user's account. " +
        "Requires the **DELETE_OWN_ACCOUNT** permission.",
};

export const ConfirmDeleteAccountOkResponse: ApiResponseOptions = {
    description: "Account deleted successfully.",
    schema: MessageSchema("Your account has been deleted successfully."),
};

export const GetUserPermissionsOperation: ApiOperationOptions = {
    summary: "Get user permissions",
    description:
        "Returns all permissions directly assigned to the user identified by userId. " +
        "Does not include permissions inherited through roles. " +
        "Users with the **MANAGE_OWN_ACCOUNT** permission may only query their own permissions. " +
        "Users with the **MANAGE_OTHER_ACCOUNT** permission may query any user's permissions.",
};

export const GetUserPermissionsOkResponse: ApiResponseOptions = {
    description: "User permissions retrieved successfully.",
    schema: {
        type: "array",
        items: PermissionSchema,
    },
};

export const GetUserPermissionsForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is querying another user's permissions without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const GetUserRolesOperation: ApiOperationOptions = {
    summary: "Get user roles",
    description:
        "Returns all roles assigned to the user identified by userId, " +
        "each including its associated permissions. " +
        "Users with the **MANAGE_OWN_ACCOUNT** permission may only query their own roles. " +
        "Users with the **MANAGE_OTHER_ACCOUNT** permission may query any user's roles.",
};

export const GetUserRolesOkResponse: ApiResponseOptions = {
    description: "User roles retrieved successfully.",
    schema: {
        type: "array",
        items: RoleSchema,
    },
};

export const GetUserRolesForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is querying another user's roles without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const GetUserRedirectionsOperation: ApiOperationOptions = {
    summary: "Get user redirections",
    description:
        "Returns all short-link redirections owned by the user identified by userId. " +
        "Users with the **MANAGE_OWN_ACCOUNT** permission may only query their own redirections. " +
        "Users with the **MANAGE_OTHER_ACCOUNT** permission may query any user's redirections.",
};

export const GetUserRedirectionsOkResponse: ApiResponseOptions = {
    description: "User redirections retrieved successfully.",
    schema: {
        type: "array",
        items: RedirectionSchema,
    },
};

export const GetUserRedirectionsForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is querying another user's redirections without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const GetUserAvatarOperation: ApiOperationOptions = {
    summary: "Get user avatar",
    description:
        "Downloads the avatar image of the user identified by userId. " +
        "The response is a binary JPEG stream with Content-Type: image/webp and " +
        'Content-Disposition: attachment; filename="<uuid>.webp". ' +
        "Accessing another user's avatar requires the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const GetUserAvatarOkResponse: ApiResponseOptions = {
    description: "Avatar image returned successfully as an octet-stream.",
    content: {
        "image/webp": {
            schema: {
                type: "string",
                format: "binary",
            },
        },
    },
};

export const GetUserAvatarNotFoundResponse: ApiResponseOptions = {
    description: "No avatar has been uploaded for the user with the given userId.",
};

export const GetUserAvatarForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is requesting another user's avatar without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const PostUserAvatarOperation: ApiOperationOptions = {
    summary: "Upload user avatar",
    description:
        "Uploads and replaces the avatar for the user identified by userId. " +
        "The image must be sent as multipart/form-data under the avatar field. " +
        "Accepted formats: **JPEG**, **PNG**, **TIFF**. Maximum file size: **5 MB**. " +
        "The image is automatically resized to fit within **768 × 768 px** " +
        "and re-encoded as JPEG at 70 % quality before storage. " +
        "If an avatar already exists it is replaced. " +
        "Requires the **MANAGE_OWN_ACCOUNT** or **MANAGE_OTHER_ACCOUNT** permission.",
};

export const PostUserAvatarBody: ApiBodyOptions = {
    description: "Multipart form with the avatar image.",
    schema: {
        type: "object",
        required: ["avatar"],
        properties: {
            avatar: {
                type: "string",
                format: "binary",
                description: "Image file (JPEG / PNG / TIFF, max 5 MB).",
            },
        },
    },
};

export const PostUserAvatarCreatedResponse: ApiResponseOptions = {
    description: "Avatar uploaded and stored successfully.",
    schema: MessageSchema("Avatar uploaded successfully."),
};

export const PostUserAvatarBadRequestResponse: ApiResponseOptions = {
    description:
        "No file was supplied, the file exceeds the 5 MB size limit, or the file type is not supported (only JPEG, PNG, and TIFF are accepted).",
};

export const PostUserAvatarForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is uploading an avatar for another user without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const DeleteUserAvatarOperation: ApiOperationOptions = {
    summary: "Delete user avatar",
    description:
        "Permanently removes the avatar of the user identified by userId from storage. " +
        "Requires the **MANAGE_OWN_ACCOUNT** or **MANAGE_OTHER_ACCOUNT** permission.",
};

export const DeleteUserAvatarNoContentResponse: ApiResponseOptions = {
    description: "Avatar deleted successfully.",
};

export const DeleteUserAvatarNotFoundResponse: ApiResponseOptions = {
    description: "No avatar exists for the user with the given userId.",
};

export const DeleteUserAvatarForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user is deleting another user's avatar without the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const CreateUserByPanelOperation: ApiOperationOptions = {
    summary: "Create user account (panel)",
    description:
        "Creates a new user account directly from the administration panel. " +
        "Unlike the public sign-up flow, the account is immediately activated. " +
        "If no password is provided, the account is created without one. " +
        "Requires the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const CreateUserByPanelCreatedResponse: ApiResponseOptions = {
    description:
        "User account created successfully. Returns the newly created user entity.",
    schema: UserSchema,
};

export const CreateUserByPanelConflictResponse: ApiResponseOptions = {
    description: "An account with the given login or email address already exists.",
};

export const CreateUserByPanelForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user does not have the **MANAGE_OTHER_ACCOUNT** permission.",
};

export const CommonUnauthorizedResponse: ApiResponseOptions = {
    description: "Missing, expired, or invalid authentication token.",
};

export const CommonInternalServerErrorResponse: ApiResponseOptions = {
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

export const GetUserByIdLogsQuery: ApiQueryOptions = {
    name: "logs",
    required: false,
    type: Boolean,
    description: "Include the user's activity logs in the response.",
    example: false,
};

export const GetUserByIdRolesQuery: ApiQueryOptions = {
    name: "roles",
    required: false,
    type: Boolean,
    description:
        "Include the user's assigned roles (with nested permissions) in the response.",
    example: false,
};

export const GetUserByIdRedirectionsQuery: ApiQueryOptions = {
    name: "redirections",
    required: false,
    type: Boolean,
    description: "Include the user's owned redirections in the response.",
    example: false,
};

export const GetUserByIdPermissionsQuery: ApiQueryOptions = {
    name: "permissions",
    required: false,
    type: Boolean,
    description: "Include the user's directly assigned permissions in the response.",
    example: false,
};

export const GetUserByIdRequestsQuery: ApiQueryOptions = {
    name: "requests",
    required: false,
    type: Boolean,
    description: "Include the user's HTTP request history in the response.",
    example: false,
};

export const DeleteSpecifiedUserAccountOperation: ApiOperationOptions = {
    summary: "Delete a specific user account",
    description:
        "Permanently deletes the user account identified by userId, " +
        "along with all associated data (sessions, redirections, codes, logs). " +
        "Requires the **DELETE_OTHER_ACCOUNT** permission. " +
        "This action is irreversible.",
};

export const DeleteSpecifiedUserAccountNoContentResponse: ApiResponseOptions = {
    description: "User account deleted successfully.",
};

export const DeleteSpecifiedUserAccountForbiddenResponse: ApiResponseOptions = {
    description:
        "The authenticated user does not have the **DELETE_OTHER_ACCOUNT** permission.",
};

export const DeleteSpecifiedUserAccountNotFoundResponse: ApiResponseOptions = {
    description: "No user with the given userId exists.",
};
