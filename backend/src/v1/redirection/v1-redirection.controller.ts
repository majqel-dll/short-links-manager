import {
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
import { AuthTypeEnum } from "@libs/enums";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@libs/decorators";
import { type Request } from "express";

@ApiTags(`Redirection`)
@Controller()
@Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
export class V1RedirectionController {
    constructor(private readonly redirectionService: V1RedirectionService) { }

    @Get(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    public async getRedirections() { }

    @Get(`v1/redirection/:id`)
    @HttpCode(HttpStatus.OK)
    public async getRedirectionById(@Param(`id`) id: string) { }

    @Post(`v1/redirection`)
    @HttpCode(HttpStatus.CREATED)
    public async createRedirection() { }

    @Put(`v1/redirection`)
    @HttpCode(HttpStatus.OK)
    public async updateRedirection() { }

    @Delete(`v1/redirection`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async deleteRedirection() { }

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
