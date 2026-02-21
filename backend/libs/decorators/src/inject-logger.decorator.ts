import { Inject, Type } from "@nestjs/common";
import { LoggerTarget } from "@libs/types";

export const getLoggerToken = (target: Type<LoggerTarget>) => `${target.name}_LOGGER`;
export const InjectLogger = (target: Type<LoggerTarget>) => Inject(getLoggerToken(target));