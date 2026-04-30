import { type ActiveUserPayload } from "@libs/types";
import { ActiveUser } from "@libs/decorators";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    Controller,
    Get,
    Redirect,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { V1CodeService } from "./v1-code.service";

@Controller(`v1/code`)
@UseInterceptors(ClassSerializerInterceptor)
export class V1CodeController {

    constructor(
        private readonly codeService: V1CodeService,
    ) { }

    @Get(`user/:id`)
    public async findActiveCodeForUser() { }

    @Get(`:code/confirm`)
    @HttpCode(HttpStatus.FOUND)
    @Redirect()
    public async confirmUserByActivationCode(
    ) {
        return { url: `${process.env.ORIGIN}/panel/account`, status: 302 }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    public async sendVerificationCodeToEmail(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<void> {
        await this.codeService.sendVerificationCodeToEmail(activeUser);
    }
}
