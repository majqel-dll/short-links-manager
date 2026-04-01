import { type Logger } from "@libs/logger";

export function onBootstrapMessageUtil(name: string, logger: Logger): void {
    const warning = process.env.NODE_ENV
        ? `Some actions may not be saved or could affect the real environment.`
        : `Be careful: every action can affect the real environment.`;

    const appName = `${name?.slice(0, 1)}${name.slice(1).toLowerCase()}`;
    logger.warn(Array.from({ length: 64 }, () => `-`).join(""), { save: false });
    logger.warn(`Application is currently running in ${process.env.NODE_ENV} mode.`);
    logger.warn(warning);
    logger.warn(Array.from({ length: 64 }, () => `-`).join(""), { save: false });
    logger.log(`${appName} application has been bootstrapped.`);
}
