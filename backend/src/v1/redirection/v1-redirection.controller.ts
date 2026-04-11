import { GetEntitiesResponse, type ActiveUserPayload } from "@libs/types";
import { V1RedirectionService } from "./v1-redirection.service";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { AuthTypeEnum, PermissionEnum } from "@libs/enums";
import { RedirectionEntity } from "@libs/entities";
import {
    CommonRedirectionInternalServerErrorResponse,
    CommonRedirectionUnauthorizedResponse,
    CommonRedirectionForbiddenResponse,
    DeleteRedirectionNoContentResponse,
    CreateRedirectionCreatedResponse,
    CreateRedirectionOperation,
    DeleteRedirectionOperation,
    DeleteRedirectionRedirectionIdParam,
    GetRedirectionByIdOkResponse,
    GetRedirectionByIdOperation,
    GetRedirectionByIdRedirectionIdParam,
    GetRedirectionsOkResponse,
    GetRedirectionsOperation,
    RedirectClientToFoundResponse,
    RedirectClientToOperation,
    RedirectClientToRouteParam,
    UpdateRedirectionConflictResponse,
    UpdateRedirectionOkResponse,
    UpdateRedirectionOperation,
} from "./v1-redirection.controller.swagger";
import { type Request } from "express";
import {
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
    ApiNoContentResponse,
    ApiForbiddenResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Redirect,
    Req,
    UseInterceptors,
} from "@nestjs/common";
import {
    BasicSearchQueryParamsDto,
    CreateRedirectionDto,
    UpdateRedirectionDto,
} from "@libs/dtos";

@ApiTags(`Redirection`)
@Controller()
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnauthorizedResponse(CommonRedirectionUnauthorizedResponse)
@ApiForbiddenResponse(CommonRedirectionForbiddenResponse)
@ApiInternalServerErrorResponse(CommonRedirectionInternalServerErrorResponse)
export class V1RedirectionController {
    constructor(private readonly redirectionService: V1RedirectionService) {}

    @Get(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.READ_OWN_REDIRECTION, PermissionEnum.READ_OTHER_REDIRECTION)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(GetRedirectionsOperation)
    @ApiOkResponse(GetRedirectionsOkResponse)
    public async getRedirections(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Query() queryParams?: BasicSearchQueryParamsDto,
    ): Promise<GetEntitiesResponse<RedirectionEntity>> {
        return this.redirectionService.getRedirectionsByUserId(
            activeUser.id,
            activeUser,
            queryParams,
        );
    }

    @Get(`v1/redirection/:redirectionId`)
    @HttpCode(HttpStatus.OK)
    @Permission(PermissionEnum.READ_OWN_REDIRECTION, PermissionEnum.READ_OTHER_REDIRECTION)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(GetRedirectionByIdOperation)
    @ApiParam(GetRedirectionByIdRedirectionIdParam)
    @ApiOkResponse(GetRedirectionByIdOkResponse)
    public async getRedirectionById(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`redirectionId`, new ParseIntPipe()) redirectionId: number,
    ): Promise<RedirectionEntity> {
        return this.redirectionService.getRedirectionById(redirectionId, activeUser);
    }

    @Post(`v1/redirection`)
    @HttpCode(HttpStatus.CREATED)
    @Permission(
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.CREATE_PREMIUM_REDIRECTION,
    )
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(CreateRedirectionOperation)
    @ApiCreatedResponse(CreateRedirectionCreatedResponse)
    public async createRedirection(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Body() body: CreateRedirectionDto,
    ): Promise<RedirectionEntity> {
        return await this.redirectionService.createRedirection(body, activeUser);
    }

    @Patch(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
        PermissionEnum.MANAGE_OTHER_REDIRECTIONS,
    )
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(UpdateRedirectionOperation)
    @ApiOkResponse(UpdateRedirectionOkResponse)
    @ApiConflictResponse(UpdateRedirectionConflictResponse)
    public async updateRedirection(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Body() body: UpdateRedirectionDto,
    ): Promise<RedirectionEntity> {
        return await this.redirectionService.updateRedirection(body, activeUser);
    }

    @Delete(`v1/redirection/:redirectionId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
        PermissionEnum.MANAGE_OTHER_REDIRECTIONS,
    )
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(DeleteRedirectionOperation)
    @ApiParam(DeleteRedirectionRedirectionIdParam)
    @ApiNoContentResponse(DeleteRedirectionNoContentResponse)
    public async deleteRedirection(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`redirectionId`, new ParseIntPipe()) redirectionId: number,
    ): Promise<void> {
        await this.redirectionService.deleteRedirection(redirectionId, activeUser);
    }

    @Get(`:route`)
    @HttpCode(HttpStatus.FOUND)
    @Redirect()
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(RedirectClientToOperation)
    @ApiParam(RedirectClientToRouteParam)
    @ApiResponse({ status: 302, ...RedirectClientToFoundResponse })
    public async redirectClientTo(
        @Param(`route`) route: string,
        @Req() request: Request,
    ): Promise<{ url: string; status: number }> {
        const urlWithId = await this.redirectionService.findRedirectionByRoute(route);
        if (
            !urlWithId ||
            route === `` ||
            route === `favicon.ico` ||
            route === `not-found`
        ) {
            return { url: `/panel/redirection/not-found?r=${route}`, status: 302 };
        }

        const [redirectionId, url] = urlWithId.split(`$$$:`);
        if (redirectionId && url) {
            void this.redirectionService.connectRedirectionWithRequest(
                request.requestEntityId,
                Number(redirectionId),
            );
        }

        return { url, status: 302 };
    }
}
