import { PermissionEnum, AuthTypeEnum, ActivationSourceEnum, CodeActionEnum } from "@libs/enums";
import { BasicResponse, GetEntitiesResponse, type ActiveUserPayload } from "@libs/types";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { V1UserService } from "./v1-user.service";
import {
    BasicSearchQueryParamsDto,
    GetUserQueryParamsDto,
    CreateUserByPanelDto,
    UpdateUserDto,
    DeleteAccountDto,
} from "@libs/dtos";
import { randomUUID } from "crypto";
import {
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiConflictResponse,
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
    GetUserRedirectionsForbiddenResponse,
    GetUserPermissionsForbiddenResponse,
    CreateUserByPanelForbiddenResponse,
    CommonInternalServerErrorResponse,
    DeleteUserAvatarNoContentResponse,
    CreateUserByPanelConflictResponse,
    DeleteUserAvatarForbiddenResponse,
    CreateUserByPanelCreatedResponse,
    DeleteUserAvatarNotFoundResponse,
    PostUserAvatarBadRequestResponse,
    ChangeUserDataForbiddenResponse,
    PostUserAvatarForbiddenResponse,
    GetUserAvatarForbiddenResponse,
    ChangeUserDataAcceptedResponse,
    ChangeUserDataNotFoundResponse,
    DeleteAccountForbiddenResponse,
    DeleteAccountNoContentResponse,
    DeleteAccountNotFoundResponse,
    PostUserAvatarCreatedResponse,
    GetUserAvatarNotFoundResponse,
    GetUserRedirectionsOkResponse,
    GetUserRolesForbiddenResponse,
    GetUserByIdForbiddenResponse,
    GetUserRedirectionsOperation,
    GetUserPermissionsOkResponse,
    GetUserByIdNotFoundResponse,
    GetUserPermissionsOperation,
    CommonUnauthorizedResponse,
    CreateUserByPanelOperation,
    DeleteUserAvatarOperation,
    GetUsersForbiddenResponse,
    ChangeUserDataOperation,
    GetUserAvatarOkResponse,
    PostUserAvatarOperation,
    DeleteAccountOperation,
    GetUserRolesOkResponse,
    GetUserAvatarOperation,
    GetUserByIdOkResponse,
    GetUserRolesOperation,
    GetUserByIdOperation,
    GetUsersOkResponse,
    PostUserAvatarBody,
    GetUsersOperation,
    UserIdParam,
} from "./v1-user.controller.swagger";
import { type Response } from "express";
import {
    ClassSerializerInterceptor,
    MaxFileSizeValidator,
    ForbiddenException,
    NotFoundException,
    FileTypeValidator,
    UseInterceptors,
    StreamableFile,
    ParseFilePipe,
    UploadedFile,
    ParseIntPipe,
    HttpStatus,
    Controller,
    UseGuards,
    HttpCode,
    Delete,
    Param,
    Query,
    Patch,
    Body,
    Post,
    Get,
    Res,
} from "@nestjs/common";
import {
    RedirectionEntity,
    PermissionEntity,
    RoleEntity,
    UserEntity,
} from "@libs/entities";
import { V1AuthService } from "../auth";
import { V1CodeService } from "../code";

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
    constructor(
        private readonly userService: V1UserService,
        private readonly authService: V1AuthService,
        private readonly codeService: V1CodeService,
    ) { }

    @Get(`list`)
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

    @Get(["", `:userId`])
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_OWN_ACCOUNT, PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(GetUserByIdOperation)
    @ApiParam(UserIdParam)
    @ApiOkResponse(GetUserByIdOkResponse)
    @ApiForbiddenResponse(GetUserByIdForbiddenResponse)
    @ApiNotFoundResponse(GetUserByIdNotFoundResponse)
    public async getUserData(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Query() queryParams: GetUserQueryParamsDto,
        @Param(`userId`) userId?: number,
    ): Promise<UserEntity> {
        console.log(userId);
        if (
            userId &&
            userId !== activeUser.id &&
            !activeUser.permissions.includes(PermissionEnum.MANAGE_OTHER_ACCOUNT)
        ) {
            throw new ForbiddenException(
                `You do not have permission to access data of other users.`,
            );
        }

        return await this.userService.getUserById(
            userId ?? activeUser.id,
            activeUser,
            queryParams,
        );
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @Permission(PermissionEnum.MANAGE_OTHER_ACCOUNT)
    @ApiOperation(CreateUserByPanelOperation)
    @ApiCreatedResponse(CreateUserByPanelCreatedResponse)
    @ApiConflictResponse(CreateUserByPanelConflictResponse)
    @ApiForbiddenResponse(CreateUserByPanelForbiddenResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async createUserByPanel(
        @Body() payload: CreateUserByPanelDto,
    ): Promise<UserEntity> {
        return await this.authService.createNewAccount(payload, ActivationSourceEnum.PANEL);
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
        @Body() body: UpdateUserDto,
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

    @Get(`delete`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.DELETE_OWN_ACCOUNT)
    public async requestAccountDeletion(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<BasicResponse> {
        await this.codeService.sendVerificationCodeToEmail(
            activeUser, CodeActionEnum.DELETE_ACCOUNT_CONFIRM
        );
        return {
            message: "Account deletion code has been sent to your email to confirm your account deletion.",
        };
    }

    @Delete(`by-code/:code`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.DELETE_OWN_ACCOUNT)
    @ApiOperation(DeleteAccountOperation)
    @ApiParam(UserIdParam)
    @ApiNoContentResponse(DeleteAccountNoContentResponse)
    @ApiForbiddenResponse(DeleteAccountForbiddenResponse)
    @ApiNotFoundResponse(DeleteAccountNotFoundResponse)
    public async deleteActiveUserAccount(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param() { code }: DeleteAccountDto,
    ): Promise<BasicResponse> {
        await this.userService.deleteAccount(activeUser.id, activeUser, code);
        return {
            message: "Your account has been deleted successfully.",
        }
    }

    @Delete(`:userId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(PermissionEnum.DELETE_OTHER_ACCOUNT)
    public async deleteSpecifiedUserAccount(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<void> {
        await this.userService.deleteAccount(userId, activeUser);
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
        @Param(`userId`, new ParseIntPipe()) userId: number,
    ): Promise<StreamableFile> {
        const avatarBuffer = await this.userService.getUserAvatar(userId);
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
