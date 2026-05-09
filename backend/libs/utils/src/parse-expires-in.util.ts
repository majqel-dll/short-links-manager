export function parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 0;
    }
    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
        s: 1_000,
        m: 60 * 1_000,
        h: 60 * 60 * 1_000,
        d: 24 * 60 * 60 * 1_000,
    };
    return value * multipliers[match[2]];
}
