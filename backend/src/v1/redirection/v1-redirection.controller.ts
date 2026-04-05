import { Controller, Delete, Get, Post, Put } from "@nestjs/common";

@Controller()
export class V1RedirectionController {
    @Get(`v1/redirection`)
    public async getRedirections() {}

    @Post(`v1/redirection`)
    public async createRedirection() {}

    @Put(`v1/redirection`)
    public async updateRedirection() {}

    @Delete(`v1/redirection`)
    public async deleteRedirection() {}

    @Get(`:redirection`)
    public async redirectClientTo() {}
}
