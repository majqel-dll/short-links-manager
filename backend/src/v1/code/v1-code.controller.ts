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

@Controller(`v1/code`)
@UseInterceptors(ClassSerializerInterceptor)
export class V1CodeController {
    @Get(`user/:id`)
    public async findActiveCodeForUser() { }

    @Get(`:code/confirm`)
    @HttpCode(HttpStatus.FOUND)
    @Redirect()
    public async confirmUserByActivationCode(
    ) {
        return { url: `/panel/account`, status: 302 }
    }

    @Get()
    public async sendVerificationCodeToEmail(
        @ActiveUser() activeUser: ActiveUserPayload,
    ) { }
}
