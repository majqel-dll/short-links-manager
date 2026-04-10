import {
    PermissionEntity,
    RedirectionEntity,
    RoleEntity,
    UserEntity,
} from "@libs/entities";
import { GetEntitiesResponse, type ActiveUserPayload } from "@libs/types";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { PermissionEnum, AuthTypeEnum } from "@libs/enums";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { BasicSearchQueryParamsDto } from "@libs/dtos";
import { V1UserService } from "./v1-user.service";
import { ApiTags } from "@nestjs/swagger";
import {
    ParseIntPipe,
    HttpStatus,
    Controller,
    UseGuards,
    HttpCode,
    Delete,
    Param,
    Patch,
    Post,
    Get,
    Query,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor,
} from "@nestjs/common";

@ApiTags(`User`)
@Controller(`v1/user`)
@UseGuards(AuthGuard, PermissionGuard)
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
@UseInterceptors(ClassSerializerInterceptor)
export class V1UserController {
    constructor(private readonly userService: V1UserService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public async getUsers(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<GetEntitiesResponse<UserEntity>> {
        return await this.userService.getUsers(queryParams);
    }

    @Get(`:userId`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public async getUserData(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<UserEntity> {
        return await this.userService.getUserById(userId, activeUser);
    }

    @Patch(`:userId`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public async changeUserData(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
        @Body() body: unknown,
    ): Promise<void> {
        return await this.userService.updateUserData(userId, activeUser, body);
    }

    @Get(`:userId/permissions`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public async getUserPermissions(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<PermissionEntity[]> {
        return await this.userService.getUserPermissions(userId, activeUser);
    }

    @Get(`:userId/roles`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public async getUserRoles(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<RoleEntity[]> {
        return await this.userService.getUserRoles(userId, activeUser);
    }

    @Get(`:userId/redirections`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    public async getUserRedirections(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<RedirectionEntity[]> {
        return await this.userService.getUserRedirections(userId, activeUser);
    }

    @Delete(`:userId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.DELETE_OWN_ACCOUNT, PermissionEnum.DELETE_OTHER_ACCOUNT)
    public async deleteAccount(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        return await this.userService.deleteAccount(userId, activeUser);
    }

    @Get(`:userId/avatar`)
    @HttpCode(HttpStatus.OK)
    public async getUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<Buffer> {
        return await this.userService.getUserAvatar(userId, activeUser);
    }

    @Post(`:userId/avatar`)
    @HttpCode(HttpStatus.CREATED)
    public async postUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        // return await this.userService.postUserAvatar(userId, activeUser);
    }

    @Patch(`:userId/avatar`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async updateUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        return await this.userService.updateUserAvatar(userId, activeUser);
    }

    @Delete(`:userId/avatar`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        return await this.userService.deleteUserAvatar(userId, activeUser);
    }
}
