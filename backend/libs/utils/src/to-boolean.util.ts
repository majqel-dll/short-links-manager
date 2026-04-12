import { TransformFnParams } from "class-transformer";

export function toBoolean({ value }: TransformFnParams) {
    if (value === true || value === `true`) return true;
    if (value === false || value === `false`) return false;
    return value;
};