import { ChangeUserPermissionsActionEnum, AuthTypeEnum, PermissionEnum } from "@libs/enums";
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { V1PermissionService } from "./v1-permission.service";
import { PermissionEntity, RoleEntity } from "@libs/entities";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import {
    BasicSearchQueryParamsDto,
    ChangeRoleDto,
    ChangeUserPermissionsDto,
} from "@libs/dtos";
import { Auth, Permission } from "@libs/decorators";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiCookieAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
    AttachPermissionInternalServerErrorResponse,
    AttachPermissionBadRequestResponse,
    AttachPermissionOkResponse,
    AttachPermissionOperation,
    CommonPermissionForbiddenResponse,
    CommonPermissionInternalServerErrorResponse,
    CommonPermissionUnauthorizedResponse,
    DetachPermissionBadRequestResponse,
    DetachPermissionInternalServerErrorResponse,
    DetachPermissionOkResponse,
    DetachPermissionOperation,
    GetAllPermissionsNotFoundResponse,
    GetAllPermissionsOkResponse,
    GetAllPermissionsOperation,
    GetAllRolesNotFoundResponse,
    GetAllRolesOkResponse,
    GetAllRolesOperation,
    UpdateUserRoleNotFoundResponse,
    UpdateUserRoleOkResponse,
    UpdateUserRoleOperation,
} from "./v1-permission.controller.swagger";
import { GetEntitiesResponse } from "@libs/types";

@ApiTags(`Permission`)
@Controller(`v1/permission`)
@UseGuards(AuthGuard, PermissionGuard)
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiCookieAuth()
@ApiUnauthorizedResponse(CommonPermissionUnauthorizedResponse)
@ApiForbiddenResponse(CommonPermissionForbiddenResponse)
@ApiInternalServerErrorResponse(CommonPermissionInternalServerErrorResponse)
export class V1PermissionController {
    constructor(private readonly permissionService: V1PermissionService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_PERMISSIONS)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOperation(GetAllPermissionsOperation)
    @ApiOkResponse(GetAllPermissionsOkResponse)
    @ApiNotFoundResponse(GetAllPermissionsNotFoundResponse)
    public async getPermissions(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<GetEntitiesResponse<PermissionEntity>> {
        return await this.permissionService.getPermissions(queryParams);
    }

    @Get(`roles`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_ROLES)
    @ApiOperation(GetAllRolesOperation)
    @ApiOkResponse(GetAllRolesOkResponse)
    @ApiNotFoundResponse(GetAllRolesNotFoundResponse)
    public async getRoles(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<GetEntitiesResponse<RoleEntity>> {
        return await this.permissionService.getRoles(queryParams);
    }

    @Put(`role/change`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_ROLES)
    @ApiOperation(UpdateUserRoleOperation)
    @ApiOkResponse(UpdateUserRoleOkResponse)
    @ApiNotFoundResponse(UpdateUserRoleNotFoundResponse)
    public async updateUserRole(@Body() body: ChangeRoleDto): Promise<void> {
        await this.permissionService.changeUserRole(body);
    }

    @Post(`attach`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_PERMISSIONS)
    @ApiOperation(AttachPermissionOperation)
    @ApiOkResponse(AttachPermissionOkResponse)
    @ApiBadRequestResponse(AttachPermissionBadRequestResponse)
    @ApiInternalServerErrorResponse(AttachPermissionInternalServerErrorResponse)
    public async attachPermissionToUser(
        @Body() { userToPermissionPairs }: ChangeUserPermissionsDto,
    ): Promise<void> {
        await this.permissionService.changeUserPermissions({
            userToPermissionPairs,
            action: ChangeUserPermissionsActionEnum.ATTACH,
        });
    }

    @Post(`detach`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_PERMISSIONS)
    @ApiOperation(DetachPermissionOperation)
    @ApiOkResponse(DetachPermissionOkResponse)
    @ApiBadRequestResponse(DetachPermissionBadRequestResponse)
    @ApiInternalServerErrorResponse(DetachPermissionInternalServerErrorResponse)
    public async detachPermissionFromUser(
        @Body() { userToPermissionPairs }: ChangeUserPermissionsDto,
    ): Promise<void> {
        await this.permissionService.changeUserPermissions({
            userToPermissionPairs,
            action: ChangeUserPermissionsActionEnum.DETACH,
        });
    }
}
