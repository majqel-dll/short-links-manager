export function getCodeFromExceptionOrNull(error: unknown): string | null {
    const toPrimitiveString = (value: unknown): string | null => {
        if (typeof value === `string`) {
            return value;
        }
        if (
            typeof value === `number` ||
            typeof value === `boolean` ||
            typeof value === `bigint`
        ) {
            return String(value);
        }
        return null;
    };

    if (typeof error !== `object` || error === null) {
        return null;
    }

    const status = `status` in error ? (error as { status?: unknown }).status : null;
    if (status !== null && status !== undefined) {
        return toPrimitiveString(status);
    }

    const response =
        `response` in error ? (error as { response?: unknown }).response : null;
    if (typeof response !== `object` || response === null) {
        return null;
    }

    const statusCode =
        `statusCode` in response ? (response as { statusCode?: unknown }).statusCode : null;
    if (statusCode !== null && statusCode !== undefined) {
        return toPrimitiveString(statusCode);
    }

    return null;
}
