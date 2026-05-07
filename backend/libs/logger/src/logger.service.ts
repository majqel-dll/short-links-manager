import { Logger as NestLogger } from "@nestjs/common";
import { ErrorConfig, LoggerConfig } from "@libs/types";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { LogLabelEnum } from "@libs/enums";
import { LogEntity } from "@libs/entities";

export class Logger {
    private appName: string = __dirname.split("/").slice(-1).join("/");
    private logger: NestLogger;
    private shouldSave = true;

    constructor(
        @InjectRepository(LogEntity)
        private readonly logRepository: Repository<LogEntity>,
        private readonly passedName?: string,
    ) {
        this.logger = new NestLogger(passedName || this.appName);
    }

    private async saveLog(
        message: unknown,
        label: LogLabelEnum,
        config?: ErrorConfig,
    ): Promise<void> {
        if (typeof message === `object`) {
            message = JSON.stringify(message);
        }

        if (typeof message === `number`) {
            message = message.toString();
        }

        const log = this.logRepository.create({
            content: message ?? null,
            label,
            userId: config?.userId ?? null,
            application: process.env.NODE_ENV,
            error: config?.error ? JSON.stringify(config.error) : null,
            duration: config?.startTime ? Date.now() - config.startTime : null,
        } as DeepPartial<LogEntity>);

        try {
            await this.logRepository.save(log);
        } catch (error) {
            this.error(`Failed to save log in database.`, {
                error: error as Error,
                save: false,
            });
        }
    }

    public log<T>(message: T, config?: LoggerConfig): T {
        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave;

        if (save) {
            void this.saveLog(message, LogLabelEnum.LOG, config);
        }

        if (context) {
            void NestLogger.log(message, context);
        } else {
            void this.logger.log(message);
        }

        return message;
    }

    public warn<T>(message: T, config?: LoggerConfig): T {
        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave;

        if (save) {
            void this.saveLog(message, LogLabelEnum.WARN, config);
        }

        if (context) {
            NestLogger.warn(message, context);
        } else {
            void this.logger.warn(message);
        }

        return message;
    }

    public error<T>(message: T, config?: ErrorConfig): T {
        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave;
        const error = config?.error ?? null;

        if (save) {
            void this.saveLog(message, LogLabelEnum.ERROR, config);
        }

        if (error) {
            if (context) {
                void NestLogger.error(error, context);
            } else {
                void this.logger.error(error);
            }
        }

        if (context) {
            NestLogger.error(message, error);
        } else {
            void this.logger.error(message);
        }

        return message;
    }

    public debug<T>(message: T, config?: LoggerConfig): T {
        const context = config?.context ?? null;
        const save = config?.save ?? this.shouldSave;

        if (save) {
            void this.saveLog(message, LogLabelEnum.DEBUG, config);
        }

        if (context) {
            NestLogger.debug(message, context);
        } else {
            void this.logger.debug(message);
        }

        return message;
    }
}
