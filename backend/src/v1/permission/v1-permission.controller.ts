import { ChangeUserPermissionsActionEnum, AuthTypeEnum, PermissionEnum } from "@libs/enums";
import { V1PermissionService } from "./v1-permission.service";
import { PermissionEntity, RoleEntity } from "@libs/entities";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { Auth, Permission } from "@libs/decorators";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    HttpStatus,
    Controller,
    UseGuards,
    HttpCode,
    Body,
    Get,
    Post,
    Put,
    Query,
} from "@nestjs/common";
import {
    BasicSearchQueryParamsDto,
    ChangeUserPermissionsDto,
    ChangeRoleDto,
} from "@libs/dtos";
import {
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import {
    AttachPermissionInternalServerErrorResponse,
    CommonPermissionInternalServerErrorResponse,
    DetachPermissionInternalServerErrorResponse,
    CommonPermissionUnauthorizedResponse,
    DetachPermissionBadRequestResponse,
    AttachPermissionBadRequestResponse,
    CommonPermissionForbiddenResponse,
    GetAllPermissionsNotFoundResponse,
    UpdateUserRoleNotFoundResponse,
    GetAllRolesNotFoundResponse,
    GetAllPermissionsOkResponse,
    DetachPermissionOkResponse,
    AttachPermissionOkResponse,
    GetAllPermissionsOperation,
    AttachPermissionOperation,
    DetachPermissionOperation,
    UpdateUserRoleOkResponse,
    UpdateUserRoleOperation,
    UpdateUserRoleConflictResponse,
    GetAllRolesOkResponse,
    GetAllRolesOperation,
    TakeQuery,
    SkipQuery,
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
    @ApiQuery(TakeQuery)
    @ApiQuery(SkipQuery)
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
    @ApiQuery(TakeQuery)
    @ApiQuery(SkipQuery)
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
    @ApiConflictResponse(UpdateUserRoleConflictResponse)
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
