import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Res,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { type ActiveUserPayload, SignInResponse } from "@libs/types";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { ActiveUser, Auth, Permission } from "@libs/decorators";
import { V1AuthService } from "./v1-auth.service";
import { SignInDto, SignUpDto } from "@libs/dtos";
import { AuthTypeEnum, PermissionEnum } from "@libs/enums";
import { type Response } from "express";

@Controller(`v1/auth`)
@UseGuards(AuthGuard, PermissionGuard)
export class V1AuthController {
    constructor(private readonly authService: V1AuthService) {}

    @Get(`sessions`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @UseInterceptors(ClassSerializerInterceptor)
    public async getActiveSessions(@ActiveUser() activeUser: ActiveUserPayload) {
        return this.authService.findActiveSessionForUser(activeUser.id);
    }

    @Post(`sign-in`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth(AuthTypeEnum.NONE)
    public async signIn(
        @Body() body: SignInDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<SignInResponse> {
        const credentials = await this.authService.generateRefreshAndAccessToken(body);
        res.cookie(`accessToken`, credentials.accessToken.value, {
            httpOnly: true,
            secure: true,
            sameSite: `strict`,
        });
        return credentials;
    }

    @Post(`sign-up`)
    @HttpCode(HttpStatus.CREATED)
    @Auth(AuthTypeEnum.NONE)
    public async signUp(@Body() body: SignUpDto): Promise<{ message: string }> {
        await this.authService.createNewAccount(body);
        return {
            message: "Account created successfully, and now is waiting for activation.",
        };
    }

    @Delete(`sign-out`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async terminateSession(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<{ message: string }> {
        await this.authService.signOut(activeUser);
        return { message: "Current session terminated successfully." };
    }

    @Delete(`sign-out/all`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async terminateAllSessions(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<{ message: string }> {
        await this.authService.terminateAllSessionsForUser(activeUser);
        return { message: "All sessions terminated successfully." };
    }

    @Delete(`sign-out/:sessionId`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async terminateSpecifiedSession(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`sessionId`) sessionUuid: string,
    ): Promise<{ message: string }> {
        await this.authService.signOut({ ...activeUser, sessionUuid });
        return { message: `Specified session ${sessionUuid} terminated successfully.` };
    }

    @Post(`password/change`)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async changePassword(@ActiveUser() activeUser: ActiveUserPayload) {}

    @Post(`token/refresh`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    public async refreshAccessToken() {}
}
