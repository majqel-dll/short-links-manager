import {
    AuthTypeEnum,
    BasicSearchQueryParamsDto,
    ChangeUserPermissionsActionEnum,
    PermissionEnum,
} from "@libs/enums";
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
import { ChangeRoleDto, ChangeUserPermissionsDto } from "@libs/dtos";
import { Auth, Permission } from "@libs/decorators";
import { ApiTags } from "@nestjs/swagger";

@ApiTags(`Permission`)
@Controller(`v1/permission`)
@UseGuards(AuthGuard, PermissionGuard)
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
export class V1PermissionController {
    constructor(private readonly permissionService: V1PermissionService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_PERMISSIONS)
    @UseInterceptors(ClassSerializerInterceptor)
    public async getAllPermissions(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<PermissionEntity[]> {
        return await this.permissionService.getPermissions(queryParams);
    }

    @Get(`roles`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_ROLES)
    public async getAllRoles(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<RoleEntity[]> {
        return await this.permissionService.getRoles(queryParams);
    }


    @Put(`role/change`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_ROLES)
    public async updateUserRole(
        @Body() body: ChangeRoleDto
    ): Promise<void> {
        this.permissionService.changeUserRole(body);
    }

    @Post(`attach`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_PERMISSIONS)
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
    public async detachPermissionFromUser(
        @Body() { userToPermissionPairs }: ChangeUserPermissionsDto,
    ): Promise<void> {
        await this.permissionService.changeUserPermissions({
            userToPermissionPairs,
            action: ChangeUserPermissionsActionEnum.DETACH,
        });
    }
}
