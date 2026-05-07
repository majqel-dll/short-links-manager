import { V1RedirectionService } from "./v1-redirection.service";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { AuthTypeEnum, PermissionEnum } from "@libs/enums";
import { RedirectionEntity } from "@libs/entities";
import {
    CommonRedirectionInternalServerErrorResponse,
    CommonRedirectionUnauthorizedResponse,
    GetRedirectionByIdRedirectionIdParam,
    DeleteRedirectionRedirectionIdParam,
    CommonRedirectionForbiddenResponse,
    DeleteRedirectionNoContentResponse,
    UpdateRedirectionConflictResponse,
    CreateRedirectionCreatedResponse,
    RedirectClientToFoundResponse,
    GetRedirectionByIdOkResponse,
    GetRedirectionByIdOperation,
    UpdateRedirectionOkResponse,
    CreateRedirectionOperation,
    DeleteRedirectionOperation,
    UpdateRedirectionOperation,
    RedirectClientToOperation,
    GetRedirectionsOkResponse,
    GetRedirectionsOperation,
    TakeQuery,
    SkipQuery,
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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    ParseIntPipe,
    HttpStatus,
    Controller,
    HttpCode,
    Redirect,
    Delete,
    Param,
    Patch,
    Query,
    Body,
    Post,
    Get,
    Req,
    ParseBoolPipe,
} from "@nestjs/common";
import {
    BasicSearchQueryParamsDto,
    CheckRouteAvailabilityDto,
    CheckRouteAvailabilityQueryDto,
    CreateRedirectionDto,
    UpdateRedirectionDto,
} from "@libs/dtos";
import {
    type ActiveUserPayload,
    GetEntitiesResponse,
    RedirectResponse,
    BasicResponse,
} from "@libs/types";

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
    @ApiQuery(TakeQuery)
    @ApiQuery(SkipQuery)
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
    ): Promise<BasicResponse> {
        await this.redirectionService.deleteRedirection(redirectionId, activeUser);
        return { message: "Redirection deleted successfully." };
    }

    @Get(`v1/redirection/availability/:route`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.CREATE_PREMIUM_REDIRECTION,
    )
    @ApiOkResponse(RedirectClientToFoundResponse)
    public async checkRedirectionRouteAvailability(
        @Param() { route }: CheckRouteAvailabilityDto,
        @Query() { premium }: CheckRouteAvailabilityQueryDto,
    ): Promise<{ available: boolean }> {
        const isAvailable: boolean = await this.redirectionService.isRouteAvailable(
            route,
            premium ?? false,
        );
        return { available: isAvailable };
    }

    @Get(`*route`)
    @HttpCode(HttpStatus.FOUND)
    @Redirect()
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(RedirectClientToOperation)
    @ApiResponse({ status: 302, ...RedirectClientToFoundResponse })
    public async redirectClientTo(@Req() request: Request): Promise<RedirectResponse> {
        const route = request.path.replace(/^\//, ``);
        const urlWithId = await this.redirectionService.findRedirectionByRoute(route);
        if (
            !urlWithId ||
            route === `` ||
            route === `favicon.ico` ||
            route === `not-found`
        ) {
            return {
                url: `/panel/redirection/not-found?r=${encodeURIComponent(route)}`,
                status: 302,
            };
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
