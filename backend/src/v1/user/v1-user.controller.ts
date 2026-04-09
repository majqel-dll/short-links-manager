import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { PermissionEnum } from "@libs/enums";
import { AuthTypeEnum } from "@libs/enums/auth/auth-type.enum";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { type ActiveUserPayload } from "@libs/types";
import {
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags(`User`)
@Controller(`v1/user`)
@UseGuards(AuthGuard, PermissionGuard)
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
export class V1UserController {
    @Get(`:userId`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserData(
        @ActiveUser() user: ActiveUserPayload,
        @Param(`userId`) userId: number,
    ) {
        if (
            userId !== user.id &&
            !user.permissions.includes(PermissionEnum.MANAGE_OTHER_ACCOUNT)
        ) {
            throw new ForbiddenException();
        }
    }

    @Patch(`:userId`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public changeUserData() { }

    @Get(`:userId/permissions`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserPermissions() { }

    @Get(`:userId/roles`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserRoles() { }

    @Get(`:userId/redirections`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserRedirections() { }

    @Delete(`:userId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public deleteAccount() { }

    @Get(`:userId/avatar`)
    @HttpCode(HttpStatus.OK)
    public async getUserAvatar(): Promise<Buffer> {
        return Buffer.alloc(0);
    }

    @HttpCode(HttpStatus.CREATED)
    public postUserAvatar() { }

    @HttpCode(HttpStatus.ACCEPTED)
    public updateUserAvatar() { }

    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteUserAvatar() { }
}
