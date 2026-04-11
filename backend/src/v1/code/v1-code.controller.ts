import {
    ClassSerializerInterceptor,
    UseInterceptors,
    Controller,
    Get,
    Post,
} from "@nestjs/common";

@Controller(`v1/code`)
@UseInterceptors(ClassSerializerInterceptor)
export class V1CodeController {
    @Get(`user/:id`)
    public async findActiveCodeForUser() {}

    @Get(`:code/confirm`)
    public async confirmUserByActivationCode() {}

    @Post()
    public async sendVerificationCodeToEmail() {}
}
