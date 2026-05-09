import { MetadataKeyEnum, type PermissionEnum } from "@libs/enums";
import { SetMetadata } from "@nestjs/common";

export const Permission = (
    ...permissions: PermissionEnum[]
): ReturnType<typeof SetMetadata> => SetMetadata(MetadataKeyEnum.PERMISSION, permissions);
