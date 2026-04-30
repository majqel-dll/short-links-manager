import { AuthGuard, PermissionGuard } from "@libs/guards";
import { type ActiveUserPayload } from "@libs/types";
import { ActiveUser, Auth } from "@libs/decorators";
import { GetCodeQueryParamsDto } from "@libs/dtos";
import { V1CodeService } from "./v1-code.service";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    Controller,
    Get,
    Redirect,
    HttpCode,
    HttpStatus,
    Param,
    Query,
    UseGuards,
    ForbiddenException,
} from "@nestjs/common";
import { AuthTypeEnum } from "@libs/enums";
import { CodeEntity } from "@libs/entities";


@Controller(`v1/code`)
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, PermissionGuard)
export class V1CodeController {

    constructor(
        private readonly codeService: V1CodeService,
    ) { }

    @Get(`user/:id`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async findActiveCodeForUser(
        @Query() { event }: GetCodeQueryParamsDto,
        @Param(`id`) userId: number,
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<CodeEntity[]> {

        if (activeUser.id !== userId) {
            throw new ForbiddenException(`You don't have permission to view codes of other users.`, HttpStatus.FORBIDDEN);
        }

        return await this.codeService.findActiveCodeForUser(userId, event);

    }

    @Get(`:code/confirm`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Redirect()
    @Auth(AuthTypeEnum.NONE)
    public async confirmUserByActivationCode(
        @Param(`code`) code: string,
    ): Promise<{ url: string, status: number }> {
        await this.codeService.activateUserWithCode(code);
        return { url: `${process.env.ORIGIN}/panel/account`, status: 202 }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async sendVerificationCodeToEmail(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<void> {
        await this.codeService.sendVerificationCodeToEmail(activeUser);
    }
}
