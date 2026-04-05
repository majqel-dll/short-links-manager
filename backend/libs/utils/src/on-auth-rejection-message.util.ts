import { type AuthTypeEnum } from "@libs/enums";
import { type Request } from "express";

export function onAuthRejectionMessage(
    type: AuthTypeEnum,
    { method, route, ip, query }: Request,
): string {
    const methodMessage: string = method
        ? ` Method: ${
              typeof method === "object"
                  ? JSON.stringify(method)
                  : method?.toString() || "unknown"
          },`
        : ``;
    const routeMessage: string = route?.path
        ? ` Route: ${
              typeof route?.path === "object"
                  ? JSON.stringify(route.path)
                  : route?.path.toString() || "unknown"
          },`
        : ``;
    const ipMessage: string = ip
        ? ` From IP: ${
              typeof ip === "object" ? JSON.stringify(ip) : ip.toString() || "unknown"
          },`
        : ``;
    const queryMessage: string =
        query && Object.keys(query).length > 0
            ? ` QueryParams: ${JSON.stringify(query)},`
            : ``;

    const message = `Failed to authenticate user on ${type} auth.`;
    return `${message} ${methodMessage}${routeMessage}${queryMessage}${ipMessage}`;
}
