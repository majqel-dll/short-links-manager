import { type LogTypeEnum } from "@libs/enums";

export type LogMessages = {
    [key in `error` | `warn` | `log`]: LogMessageContent;
};

export type LogMessageContent = {
    [key: string]: LogMessageFunction;
};

type LogMessageFunction =
    | (() => string)
    | ((param?: number | string) => string)
    | ((param?: number | string, param2?: number | string) => string);

export type LoggerConfig = {
    context?: unknown;
    save?: boolean;
    userId?: number;
    startTime?: number;
    tag?: LogTypeEnum;
};

export type ErrorConfig = LoggerConfig & {
    error?: Error | object | string;
};
