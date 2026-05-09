import { Inject, type Type } from "@nestjs/common";
import { type LoggerTarget } from "@libs/types";

export const getLoggerToken = (target: Type<LoggerTarget>): string =>
    `${target.name}_LOGGER`;
export const InjectLogger = (target: Type<LoggerTarget>): ReturnType<typeof Inject> =>
    Inject(getLoggerToken(target));
