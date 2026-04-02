import { Body, Controller, Delete, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { V1AuthService } from "./v1-auth.service";
import { SignInDto, SignUpDto } from "@libs/dtos";
import { SignInResponse } from "@libs/types";
import { AuthTypeEnum } from "@libs/enums";
import { Auth } from "@libs/decorators";

@Controller(`v1/auth`)
@UseGuards()
export class V1AuthController {

    constructor(
        private readonly authService: V1AuthService,
    ) { }

    @Post(`sign-in`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth(AuthTypeEnum.NONE)
    public async signIn(
        @Body() body: SignInDto,
    ): Promise<SignInResponse> {
        return await this.authService.generateRefreshAndAccessToken(body);
    }

    @Post(`sign-up`)
    @HttpCode(HttpStatus.CREATED)
    @Auth(AuthTypeEnum.NONE)
    public async signUp(
        @Body() body: SignUpDto,
    ): Promise<void> {
        await this.authService.createNewAccount(body);
    }

    @Post(`password/change`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async changePassword() { }

    @Post(`token/refresh`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async refreshAccessToken() { }

    @Delete(`token`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async terminateSession() { }
}
