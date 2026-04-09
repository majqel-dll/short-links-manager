import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Redirect,
    Req,
} from "@nestjs/common";
import { V1RedirectionService } from "./v1-redirection.service";
import { AuthTypeEnum, PermissionEnum } from "@libs/enums";
import { ApiTags } from "@nestjs/swagger";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { type Request } from "express";
import { type ActiveUserPayload } from "@libs/types";

@ApiTags(`Redirection`)
@Controller()
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
export class V1RedirectionController {
    constructor(private readonly redirectionService: V1RedirectionService) { }

    @Get(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.READ_OTHER_REDIRECTION
    )
    public async getRedirections(@ActiveUser() user: ActiveUserPayload) { }

    @Get(`v1/redirection/:redirectionId`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.READ_OWN_REDIRECTION,
        PermissionEnum.READ_OTHER_REDIRECTION
    )
    public async getRedirectionById(
        @ActiveUser() user: ActiveUserPayload,
        @Param(`redirectionId`) redirectionId: string,
    ) { }

    @Post(`v1/redirection`)
    @HttpCode(HttpStatus.CREATED)
    @Permission(
        PermissionEnum.CREATE_BASIC_REDIRECTION,
        PermissionEnum.CREATE_PREMIUM_REDIRECTION,
    )
    public async createRedirection(@ActiveUser() user: ActiveUserPayload, @Body() body) { }

    @Put(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    @Permission(
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
    )
    public async updateRedirection(@ActiveUser() user: ActiveUserPayload, @Body() body) { }

    @Delete(`v1/redirection/:redirectionId`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Permission(
        PermissionEnum.MANAGE_OWN_BASIC_REDIRECTION,
        PermissionEnum.MANAGE_OWN_PREMIUM_REDIRECTION,
    )
    public async deleteRedirection(
        @ActiveUser() user: ActiveUserPayload,
        @Param(`redirectionId`) redirectionId: string,
    ) { }

    @Get(`:route`)
    @HttpCode(HttpStatus.PERMANENT_REDIRECT)
    @Redirect()
    public async redirectClientTo(@Param(`route`) route: string, @Req() request: Request) {
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
