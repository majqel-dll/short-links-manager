import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ActiveUserPayload } from "@libs/types";
import { MetadataKeyEnum } from "@libs/enums";
import { Request } from "express";

export const ActiveUser = createParamDecorator((field: string, ctx: ExecutionContext): ActiveUserPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[MetadataKeyEnum.USER_KEY];
    if (!user) return null;
    if (field) return user[field] ?? null;
    return user;
});