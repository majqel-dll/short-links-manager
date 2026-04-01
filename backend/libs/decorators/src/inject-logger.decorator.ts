import { Inject, type Type } from "@nestjs/common";
import { type LoggerTarget } from "@libs/types";

export const getLoggerToken = (target: Type<LoggerTarget>) => `${target.name}_LOGGER`;
export const InjectLogger = (target: Type<LoggerTarget>) => Inject(getLoggerToken(target));
