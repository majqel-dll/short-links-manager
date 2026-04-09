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
    Query,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { V1PermissionService } from "./v1-permission.service";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { ChangeUserPermissionsDto } from "@libs/dtos";
import { Auth, Permission } from "@libs/decorators";
import { PermissionEntity } from "@libs/entities";
import { ApiTags } from "@nestjs/swagger";

@ApiTags(`Permission`)
@Controller(`v1/permission`)
@UseGuards(AuthGuard, PermissionGuard)
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
export class V1PermissionController {
    constructor(private readonly permissionService: V1PermissionService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.MANAGE_PERMISSIONS)
    @UseInterceptors(ClassSerializerInterceptor)
    public async getAllPermissions(
        @Query() queryParams: BasicSearchQueryParamsDto,
    ): Promise<PermissionEntity[]> {
        return this.permissionService.getPermissions(queryParams);
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
