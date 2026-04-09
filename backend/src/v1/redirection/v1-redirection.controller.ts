import {
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Redirect,
    Req,
} from "@nestjs/common";
import { V1RedirectionService } from "./v1-redirection.service";
import { type Request } from "express";

@Controller()
export class V1RedirectionController {
    constructor(private readonly redirectionService: V1RedirectionService) {}

    @Get(`v1/redirection`)
    public async getRedirections() {}

    @Post(`v1/redirection`)
    public async createRedirection() {}

    @Put(`v1/redirection`)
    public async updateRedirection() {}

    @Delete(`v1/redirection`)
    public async deleteRedirection() {}

    @Get(`:route`)
    @Redirect()
    public async redirectClientTo(@Param(`route`) route: string, @Req() request: Request) {
        const urlWithId = await this.redirectionService.findRedirectionByRoute(route);
        if (
            !urlWithId ||
            route === `` ||
            route === `favicon.ico` ||
            route === `not-found`
        ) {
            return { url: `/panel/redirection/not-found`, status: 302 };
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
