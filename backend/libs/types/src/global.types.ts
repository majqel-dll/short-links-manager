import { type MetadataKeyEnum } from "@libs/enums";
import { type ActiveUserPayload } from "./auth";

declare global {
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
