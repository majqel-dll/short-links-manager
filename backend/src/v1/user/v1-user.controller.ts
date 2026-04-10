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
    Post,
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
        @Param(`userId`, new ParseIntPipe()) userId: number,
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
    public changeUserData(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Get(`:userId/permissions`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserPermissions(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Get(`:userId/roles`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserRoles(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Get(`:userId/redirections`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public getUserRedirections(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Delete(`:userId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public deleteAccount(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Get(`:userId/avatar`)
    @HttpCode(HttpStatus.OK)
    public async getUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<Buffer> {
        return Buffer.alloc(0);
    }

    @Post(`:userId/avatar`)
    @HttpCode(HttpStatus.CREATED)
    public postUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Patch(`:userId/avatar`)
    @HttpCode(HttpStatus.ACCEPTED)
    public updateUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }

    @Delete(`:userId/avatar`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public deleteUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ) { }
}
