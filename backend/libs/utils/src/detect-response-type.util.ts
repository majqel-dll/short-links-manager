export function detectResponseType(data: unknown): string {
    if (Buffer.isBuffer(data)) {
        return "buffer";
    }
    if (typeof data === "string") {
        return "string";
    }
    if (typeof data === "object") {
        return "json";
    }
    if (data === undefined || data === null) {
        return "empty";
    }
    return typeof data;
}
