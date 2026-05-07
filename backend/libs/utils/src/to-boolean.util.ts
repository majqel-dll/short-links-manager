import { type TransformFnParams } from "class-transformer";

export function toBoolean<T = unknown>({ value }: TransformFnParams): boolean | T {
    if (value === true || value === `true`) {
        return true;
    }
    if (value === false || value === `false`) {
        return false;
    }
    return value as T | boolean;
}
