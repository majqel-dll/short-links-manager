import {
    type ApiOperationOptions,
    type ApiResponseOptions,
    type ApiQueryOptions,
} from "@nestjs/swagger";

const PermissionSchema = {
    type: "object",
    properties: {
        id: { type: "number", example: 1 },
        value: { type: "string", example: "MANAGE_PERMISSIONS" },
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
    },
} as const;

const RoleSchema = {
    type: "object",
    properties: {
        id: { type: "number", example: 1 },
        name: { type: "string", example: "ADMIN" },
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
    },
} as const;

export const GetAllPermissionsOperation: ApiOperationOptions = {
    summary: "List all permissions",
    description:
        "Returns a paginated list of all permissions defined in the system. " +
        "Requires the **MANAGE_PERMISSIONS** permission. " +
        "The assignedEnum field is excluded from the response.",
};

export const GetAllPermissionsOkResponse: ApiResponseOptions = {
    description: "Permissions retrieved successfully.",
    schema: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: PermissionSchema,
            },
            meta: {
                type: "object",
                properties: {
                    totalRecords: { type: "number", example: 20 },
                    currentPage: { type: "number", example: 0 },
                    pageSize: { type: "number", example: 10 },
                    totalPages: { type: "number", example: 2 },
                },
            },
        },
    },
};

export const GetAllPermissionsNotFoundResponse: ApiResponseOptions = {
    description: "No permissions found in the database.",
};

export const GetAllRolesOperation: ApiOperationOptions = {
    summary: "List all roles",
    description:
        "Returns a paginated list of all roles defined in the system. " +
        "Requires the **MANAGE_ROLES** permission. " +
        "The assignedEnum field is excluded from the response.",
};

export const GetAllRolesOkResponse: ApiResponseOptions = {
    description: "Roles retrieved successfully.",
    schema: {
        type: "object",
        properties: {
            data: {
                type: "array",
                items: RoleSchema,
            },
            meta: {
                type: "object",
                properties: {
                    totalRecords: { type: "number", example: 4 },
                    currentPage: { type: "number", example: 0 },
                    pageSize: { type: "number", example: 4 },
                    totalPages: { type: "number", example: 1 },
                },
            },
        },
    },
};

export const GetAllRolesNotFoundResponse: ApiResponseOptions = {
    description: "No roles found in the database.",
};

export const UpdateUserRoleOperation: ApiOperationOptions = {
    summary: "Change user role",
    description:
        "Assigns the specified role to the given user, replacing all previously held roles. " +
        "If the user already has this role assigned, a 409 Conflict is returned. " +
        "Requires the **MANAGE_ROLES** permission.",
};

export const UpdateUserRoleOkResponse: ApiResponseOptions = {
    description: "User role updated successfully.",
};

export const UpdateUserRoleConflictResponse: ApiResponseOptions = {
    description: "The user already has the specified role assigned.",
};

export const UpdateUserRoleNotFoundResponse: ApiResponseOptions = {
    description: "The specified user or role was not found.",
};

export const AttachPermissionOperation: ApiOperationOptions = {
    summary: "Attach permissions to users",
    description:
        "Attaches one or more permissions to the specified users in a single batch operation. " +
        "Each entry in userToPermissionPairs links one user to one permission. " +
        "Pairs where the user already holds the given permission are silently skipped. " +
        "If any pair references a non-existent user or permission, that pair is collected as an error " +
        "and a 500 response is returned after processing all remaining pairs — " +
        "successfully resolved pairs are still persisted.",
};

export const AttachPermissionOkResponse: ApiResponseOptions = {
    description: "All provided user-permission pairs attached successfully.",
};

export const AttachPermissionBadRequestResponse: ApiResponseOptions = {
    description:
        "Request body failed validation — userToPermissionPairs must contain at least one entry with valid integer IDs.",
};

export const AttachPermissionInternalServerErrorResponse: ApiResponseOptions = {
    description:
        "One or more user-permission pairs could not be attached because the referenced user or permission was not found. " +
        "Pairs that were valid have already been persisted.",
};

export const DetachPermissionOperation: ApiOperationOptions = {
    summary: "Detach permissions from users",
    description:
        "Detaches one or more permissions from the specified users in a single batch operation. " +
        "Each entry in userToPermissionPairs removes one permission from one user. " +
        "Pairs where the user does not hold the given permission are silently skipped. " +
        "If any pair references a non-existent user or permission, that pair is collected as an error " +
        "and a 500 response is returned after processing all remaining pairs — " +
        "successfully resolved pairs are still persisted.",
};

export const DetachPermissionOkResponse: ApiResponseOptions = {
    description: "All provided user-permission pairs detached successfully.",
};

export const DetachPermissionBadRequestResponse: ApiResponseOptions = {
    description:
        "Request body failed validation — userToPermissionPairs must contain at least one entry with valid integer IDs.",
};

export const DetachPermissionInternalServerErrorResponse: ApiResponseOptions = {
    description:
        "One or more user-permission pairs could not be detached because the referenced user or permission was not found. " +
        "Pairs that were valid have already been persisted.",
};

export const CommonPermissionUnauthorizedResponse: ApiResponseOptions = {
    description: "Missing, expired, or invalid authentication token.",
};

export const CommonPermissionForbiddenResponse: ApiResponseOptions = {
    description:
        "Account is not yet activated, has been blocked, or does not have the required permission to perform this action.",
};

export const CommonPermissionInternalServerErrorResponse: ApiResponseOptions = {
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
