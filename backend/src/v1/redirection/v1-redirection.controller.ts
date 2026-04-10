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
    Post,
    Put,
    Query,
    Redirect,
    Req,
    UseInterceptors,
} from "@nestjs/common";
import { BasicSearchQueryParamsDto, CreateRedirectionDto } from "@libs/dtos";
import { GetEntitiesResponse, type ActiveUserPayload } from "@libs/types";
import { V1RedirectionService } from "./v1-redirection.service";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { AuthTypeEnum, PermissionEnum } from "@libs/enums";
import { RedirectionEntity } from "@libs/entities";
import { ApiTags } from "@nestjs/swagger";
import { type Request } from "express";

@ApiTags(`Redirection`)
@Controller()
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
@UseInterceptors(ClassSerializerInterceptor)
export class V1RedirectionController {
    constructor(private readonly redirectionService: V1RedirectionService) { }

    @Get(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.READ_OTHER_REDIRECTION)
    public async getRedirections(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Query() queryParams?: BasicSearchQueryParamsDto,
    ): Promise<GetEntitiesResponse<RedirectionEntity>> {
        return this.redirectionService.getRedirectionsByUserId(
            activeUser.id,
            activeUser,
            queryParams
        );

    }

    @Get(`v1/redirection/:redirectionId`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.READ_OTHER_REDIRECTION)
    public async getRedirectionById(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`redirectionId`, new ParseIntPipe) redirectionId: number,
    ): Promise<RedirectionEntity> {
        return this.redirectionService.getRedirectionById(redirectionId, activeUser);
    }

    @Post(`v1/redirection`)
    @HttpCode(HttpStatus.CREATED)
    @Permission(
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.CREATE_PREMIUM_REDIRECTION)
    public async createRedirection(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Body() body: CreateRedirectionDto
    ) {

    }

    @Put(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
    )
    public async updateRedirection(@ActiveUser() activeUser: ActiveUserPayload, @Body() body) { }

    @Delete(`v1/redirection/:redirectionId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
        PermissionEnum.MANAGE_OTHER_REDIRECTIONS
    )
    public async deleteRedirection(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`redirectionId`, new ParseIntPipe) redirectionId: number,
    ) { }

    @Get(`:route`)
    @HttpCode(HttpStatus.PERMANENT_REDIRECT)
    @Redirect()
    public async redirectClientTo(
        @Param(`route`) route: string,
        @Req() request: Request
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
