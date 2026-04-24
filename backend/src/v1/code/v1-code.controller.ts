import { type ActiveUserPayload } from "@libs/types";
import { ActiveUser } from "@libs/decorators";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    Controller,
    Get,
} from "@nestjs/common";

@Controller(`v1/code`)
@UseInterceptors(ClassSerializerInterceptor)
export class V1CodeController {
    @Get(`user/:id`)
    public async findActiveCodeForUser() { }

    @Get(`:code/confirm`)
    public async confirmUserByActivationCode() { }

    @Get()
    public async sendVerificationCodeToEmail(
        @ActiveUser() activeUser: ActiveUserPayload,
    ) { }
}
