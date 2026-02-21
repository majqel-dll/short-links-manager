export function getCodeFromExceptionOrNull<T extends unknown>(error: T): string {
    if (typeof error === `object`) {
        if (`status` in error && error?.status) {
            return error?.status?.toString() || null;
        };
        if (`response` in error && typeof error?.response === `object`
            && `statusCode` in error?.response && error?.response?.statusCode) {
            return error?.response?.statusCode?.toString() || null;
        };
    };
    return null;
};