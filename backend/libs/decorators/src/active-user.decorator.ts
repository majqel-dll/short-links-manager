import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type ActiveUserPayload } from "@libs/types";
import { MetadataKeyEnum } from "@libs/enums";
import { type Request } from "express";

export const ActiveUser = createParamDecorator((field: string, ctx: ExecutionContext): ActiveUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[MetadataKeyEnum.USER_KEY];
    if (!user) {
        return null;
    }
    if (field) {
        return user[field] ?? null;
    }
    return user;
});
