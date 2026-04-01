import { MetadataKeyEnum, PermissionEnum } from "@libs/enums";
import { SetMetadata } from "@nestjs/common";

export const Permission = (...permissions: PermissionEnum[]) => SetMetadata(MetadataKeyEnum.PERMISSION, permissions);