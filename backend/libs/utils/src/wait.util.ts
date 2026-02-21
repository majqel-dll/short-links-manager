export async function wait(forTime: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, forTime));
};