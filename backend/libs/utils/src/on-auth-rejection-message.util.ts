import { type AuthTypeEnum } from "@libs/enums";
import { type Request } from "express";

export function onAuthRejectionMessage(
    type: AuthTypeEnum,
    { method, route, ip, query }: Request,
): string {
    const toSafeString = (value: unknown): string => {
        if (typeof value === `string`) {
            return value;
        }
        if (
            typeof value === `number` ||
            typeof value === `boolean` ||
            typeof value === `bigint` ||
            typeof value === `symbol`
        ) {
            return String(value);
        }
        if (value && typeof value === `object`) {
            return JSON.stringify(value);
        }
        return "unknown";
    };

    const routePath = (route as { path?: unknown } | undefined)?.path;
    const methodMessage: string = method
        ? ` Method: ${
              typeof method === "object" ? JSON.stringify(method) : toSafeString(method)
          },`
        : ``;
    const routeMessage: string = routePath
        ? ` Route: ${
              typeof routePath === "object"
                  ? JSON.stringify(routePath)
                  : toSafeString(routePath)
          },`
        : ``;
    const ipMessage: string = ip
        ? ` From IP: ${typeof ip === "object" ? JSON.stringify(ip) : toSafeString(ip)},`
        : ``;
    const queryMessage: string =
        query && Object.keys(query).length > 0
            ? ` QueryParams: ${JSON.stringify(query)},`
            : ``;

    const message = `Failed to authenticate user on ${type} auth.`;
    return `${message} ${methodMessage}${routeMessage}${queryMessage}${ipMessage}`;
}
