export function calculateSize(data: unknown): number {
    if (data === undefined || data === null) return 0;
    if (Buffer.isBuffer(data)) return data.length;
    if (typeof data === 'string') return Buffer.byteLength(data, 'utf-8');
    try {
        return Buffer.byteLength(JSON.stringify(data), 'utf-8');
    } catch {
        return 0;
    };
};