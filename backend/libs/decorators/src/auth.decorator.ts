import { type AuthTypeEnum, MetadataKeyEnum } from "@libs/enums";
import { SetMetadata } from "@nestjs/common";

export const Auth = (...authTypes: AuthTypeEnum[]): ReturnType<typeof SetMetadata> =>
    SetMetadata(MetadataKeyEnum.AUTH_TYPES, authTypes);
