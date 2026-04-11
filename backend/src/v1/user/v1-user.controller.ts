import { GetEntitiesResponse, type ActiveUserPayload } from "@libs/types";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { PermissionEnum, AuthTypeEnum } from "@libs/enums";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { BasicSearchQueryParamsDto } from "@libs/dtos";
import { V1UserService } from "./v1-user.service";
import { randomUUID } from "crypto";
import {
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiAcceptedResponse,
    ApiNotFoundResponse,
    ApiCreatedResponse,
    ApiCookieAuth,
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiConsumes,
    ApiParam,
    ApiBody,
    ApiTags,
} from "@nestjs/swagger";
import {
    ChangeUserDataAcceptedResponse,
    ChangeUserDataForbiddenResponse,
    ChangeUserDataNotFoundResponse,
    ChangeUserDataOperation,
    CommonInternalServerErrorResponse,
    CommonUnauthorizedResponse,
    DeleteAccountForbiddenResponse,
    DeleteAccountNoContentResponse,
    DeleteAccountNotFoundResponse,
    DeleteAccountOperation,
    DeleteUserAvatarForbiddenResponse,
    DeleteUserAvatarNoContentResponse,
    DeleteUserAvatarNotFoundResponse,
    DeleteUserAvatarOperation,
    GetUserAvatarForbiddenResponse,
    GetUserAvatarNotFoundResponse,
    GetUserAvatarOkResponse,
    GetUserAvatarOperation,
    GetUserByIdForbiddenResponse,
    GetUserByIdNotFoundResponse,
    GetUserByIdOkResponse,
    GetUserByIdOperation,
    GetUserPermissionsForbiddenResponse,
    GetUserPermissionsOkResponse,
    GetUserPermissionsOperation,
    GetUserRedirectionsForbiddenResponse,
    GetUserRedirectionsOkResponse,
    GetUserRedirectionsOperation,
    GetUserRolesForbiddenResponse,
    GetUserRolesOkResponse,
    GetUserRolesOperation,
    GetUsersForbiddenResponse,
    GetUsersOkResponse,
    GetUsersOperation,
    PostUserAvatarBadRequestResponse,
    PostUserAvatarBody,
    PostUserAvatarCreatedResponse,
    PostUserAvatarForbiddenResponse,
    PostUserAvatarOperation,
    UserIdParam,
} from "./v1-user.controller.swagger";
import { type Response } from "express";
import {
    ClassSerializerInterceptor,
    MaxFileSizeValidator,
    NotFoundException,
    FileTypeValidator,
    UseInterceptors,
    ParseFilePipe,
    UploadedFile,
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
    Res,
    StreamableFile,
} from "@nestjs/common";
import {
    PermissionEntity,
    RedirectionEntity,
    RoleEntity,
    UserEntity,
} from "@libs/entities";

@ApiTags(`User`)
@Controller(`v1/user`)
@UseGuards(AuthGuard, PermissionGuard)
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
@ApiBearerAuth()
@ApiCookieAuth()
@ApiUnauthorizedResponse(CommonUnauthorizedResponse)
@ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
@UseInterceptors(ClassSerializerInterceptor)
export class V1UserController {
    constructor(private readonly userService: V1UserService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(GetUsersOperation)
    @ApiOkResponse(GetUsersOkResponse)
    @ApiForbiddenResponse(GetUsersForbiddenResponse)
    public async getUsers(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<GetEntitiesResponse<UserEntity>> {
        return await this.userService.getUsers(queryParams);
    }

    @Get(`:userId`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(GetUserByIdOperation)
    @ApiParam(UserIdParam)
    @ApiOkResponse(GetUserByIdOkResponse)
    @ApiForbiddenResponse(GetUserByIdForbiddenResponse)
    @ApiNotFoundResponse(GetUserByIdNotFoundResponse)
    public async getUserData(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<UserEntity> {
        return await this.userService.getUserById(userId, activeUser);
    }

    @Patch(`:userId`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(ChangeUserDataOperation)
    @ApiParam(UserIdParam)
    @ApiAcceptedResponse(ChangeUserDataAcceptedResponse)
    @ApiForbiddenResponse(ChangeUserDataForbiddenResponse)
    @ApiNotFoundResponse(ChangeUserDataNotFoundResponse)
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
    @ApiOperation(GetUserPermissionsOperation)
    @ApiParam(UserIdParam)
    @ApiOkResponse(GetUserPermissionsOkResponse)
    @ApiForbiddenResponse(GetUserPermissionsForbiddenResponse)
    public async getUserPermissions(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<PermissionEntity[]> {
        return await this.userService.getUserPermissions(userId, activeUser);
    }

    @Get(`:userId/roles`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(GetUserRolesOperation)
    @ApiParam(UserIdParam)
    @ApiOkResponse(GetUserRolesOkResponse)
    @ApiForbiddenResponse(GetUserRolesForbiddenResponse)
    public async getUserRoles(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<RoleEntity[]> {
        return await this.userService.getUserRoles(userId, activeUser);
    }

    @Get(`:userId/redirections`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(GetUserRedirectionsOperation)
    @ApiParam(UserIdParam)
    @ApiOkResponse(GetUserRedirectionsOkResponse)
    @ApiForbiddenResponse(GetUserRedirectionsForbiddenResponse)
    public async getUserRedirections(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<RedirectionEntity[]> {
        return await this.userService.getUserRedirections(userId, activeUser);
    }

    @Delete(`:userId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.DELETE_OWN_ACCOUNT, PermissionEnum.DELETE_OTHER_ACCOUNT)
    @ApiOperation(DeleteAccountOperation)
    @ApiParam(UserIdParam)
    @ApiNoContentResponse(DeleteAccountNoContentResponse)
    @ApiForbiddenResponse(DeleteAccountForbiddenResponse)
    @ApiNotFoundResponse(DeleteAccountNotFoundResponse)
    public async deleteAccount(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        return await this.userService.deleteAccount(userId, activeUser);
    }

    @Get(`:userId/avatar`)
    @HttpCode(HttpStatus.OK)
    @ApiOperation(GetUserAvatarOperation)
    @ApiParam(UserIdParam)
    @ApiOkResponse(GetUserAvatarOkResponse)
    @ApiNotFoundResponse(GetUserAvatarNotFoundResponse)
    @ApiForbiddenResponse(GetUserAvatarForbiddenResponse)
    public async getUserAvatar(
        @Res({ passthrough: true }) res: Response,
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<StreamableFile> {
        const avatarBuffer = await this.userService.getUserAvatar(userId, activeUser);
        if (avatarBuffer === null) {
            throw new NotFoundException(`Avatar not found for user with id ${userId}.`);
        }

        res.setHeader(`Content-Disposition`, `attachment; filename="${randomUUID()}.webp"`);
        res.setHeader(`Content-Type`, `image/webp`);
        return new StreamableFile(avatarBuffer);
    }

    @Post(`:userId/avatar`)
    @HttpCode(HttpStatus.CREATED)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @UseInterceptors(FileInterceptor(`avatar`))
    @ApiOperation(PostUserAvatarOperation)
    @ApiParam(UserIdParam)
    @ApiConsumes(`multipart/form-data`)
    @ApiBody(PostUserAvatarBody)
    @ApiCreatedResponse(PostUserAvatarCreatedResponse)
    @ApiBadRequestResponse(PostUserAvatarBadRequestResponse)
    @ApiForbiddenResponse(PostUserAvatarForbiddenResponse)
    public async postUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5_000_000 }),
                    new FileTypeValidator({ fileType: /image\/(jpeg|png|tiff)/ }),
                ],
            }),
        )
        avatar: Express.Multer.File,
    ): Promise<void> {
        return await this.userService.postUserAvatar(userId, activeUser, avatar);
    }

    @Delete(`:userId/avatar`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(DeleteUserAvatarOperation)
    @ApiParam(UserIdParam)
    @ApiNoContentResponse(DeleteUserAvatarNoContentResponse)
    @ApiNotFoundResponse(DeleteUserAvatarNotFoundResponse)
    @ApiForbiddenResponse(DeleteUserAvatarForbiddenResponse)
    public async deleteUserAvatar(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        return await this.userService.deleteUserAvatar(userId, activeUser);
    }
}
