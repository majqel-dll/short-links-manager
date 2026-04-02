import { type MetadataKeyEnum } from "@libs/enums";
import { type ActiveUserPayload } from "./auth";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            [MetadataKeyEnum.USER_KEY]?: ActiveUserPayload;
            userId?: number;
            executionId?: string;
            requestEntityId?: number;
            processingStartTime?: Date;
        }
    }
}
