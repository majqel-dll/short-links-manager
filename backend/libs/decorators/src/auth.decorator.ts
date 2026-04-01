import { MetadataKeyEnum } from "@libs/enums";
import { SetMetadata } from "@nestjs/common";
import { AuthTypeEnum } from "@libs/enums";

export const Auth = (...authTypes: AuthTypeEnum[]) => SetMetadata(MetadataKeyEnum.AUTH_TYPES, authTypes);