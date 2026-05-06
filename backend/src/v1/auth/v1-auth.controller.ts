import { type ActiveUserPayload, BasicResponse } from "@libs/types";
import { type SessionEntity } from "@libs/entities";
import { ActiveUser, Auth } from "@libs/decorators";
import { V1AuthService } from "./v1-auth.service";
import { AuthTypeEnum } from "@libs/enums";
import { parseExpiresIn } from "@libs/utils";
import { AuthGuard } from "@libs/guards";
import { type Response } from "express";
import {
    ChangePasswordUnauthorizedResponse,
    CommonInternalServerErrorResponse,
    ChangePasswordBadRequestResponse,
    ChangePasswordForbiddenResponse,
    ChangePasswordAcceptedResponse,
    RefreshTokenBadRequestResponse,
    SignOutSessionNotFoundResponse,
    RefreshTokenForbiddenResponse,
    SignInUnauthorizedResponse,
    CommonUnauthorizedResponse,
    SignOutSessionOkResponse,
    SignOutNotFoundResponse,
    ChangePasswordOperation,
    SignOutSessionOperation,
    SignOutSessionUuidParam,
    RefreshTokenOkResponse,
    SignUpConflictResponse,
    SignInAcceptedResponse,
    SignUpCreatedResponse,
    GetSessionsOkResponse,
    RefreshTokenOperation,
    GetSessionsOperation,
    SignOutAllOkResponse,
    SignOutAllOperation,
    SignOutOkResponse,
    SignOutOperation,
    SignInOperation,
    SignUpOperation,
    RequestPasswordResetOperation,
    RequestPasswordResetAcceptedResponse,
    ConfirmPasswordResetOperation,
    ConfirmPasswordResetAcceptedResponse,
    ConfirmPasswordResetBadRequestResponse,
} from "./v1-auth.controller.swagger";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    HttpStatus,
    Controller,
    UseGuards,
    HttpCode,
    Delete,
    Param,
    Body,
    Get,
    Post,
    Res,
} from "@nestjs/common";
import {
    ApiInternalServerErrorResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiAcceptedResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import {
    GetPasswordResetKeyDto,
    PasswordChangeDto,
    RefreshTokenDto,
    ResetPasswordDto,
    SignInDto,
    SignUpDto,
} from "@libs/dtos";

@ApiTags("Auth")
@Controller(`v1/auth`)
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class V1AuthController {
    constructor(private readonly authService: V1AuthService) {}

    @Get(`sessions`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(GetSessionsOperation)
    @ApiOkResponse(GetSessionsOkResponse)
    @ApiUnauthorizedResponse(CommonUnauthorizedResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async getActiveSessions(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<SessionEntity[]> {
        return this.authService.findActiveSessionForUser(activeUser.id);
    }

    @Post(`sign-in`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(SignInOperation)
    @ApiAcceptedResponse(SignInAcceptedResponse)
    @ApiUnauthorizedResponse(SignInUnauthorizedResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async signIn(
        @Body() body: SignInDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const credentials = await this.authService.generateRefreshAndAccessToken(body);
        res.cookie(`accessToken`, credentials.accessToken.value, {
            httpOnly: true,
            secure: true,
            sameSite: `strict`,
            maxAge: parseExpiresIn(credentials.accessToken.expiresIn),
        });
        res.cookie(`refreshToken`, credentials.refreshToken.value, {
            httpOnly: true,
            secure: true,
            sameSite: `strict`,
            maxAge: parseExpiresIn(credentials.refreshToken.expiresIn),
        });
    }

    @Post(`sign-up`)
    @HttpCode(HttpStatus.CREATED)
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(SignUpOperation)
    @ApiCreatedResponse(SignUpCreatedResponse)
    @ApiConflictResponse(SignUpConflictResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async signUp(@Body() body: SignUpDto): Promise<BasicResponse> {
        await this.authService.createNewAccount(body);
        return {
            message: "Account created successfully, and now is waiting for activation.",
        };
    }

    @Delete(`sign-out`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(SignOutOperation)
    @ApiOkResponse(SignOutOkResponse)
    @ApiUnauthorizedResponse(CommonUnauthorizedResponse)
    @ApiNotFoundResponse(SignOutNotFoundResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async terminateSession(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<BasicResponse> {
        await this.authService.signOut(activeUser);
        return { message: "Current session terminated successfully." };
    }

    @Delete(`sign-out/all`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(SignOutAllOperation)
    @ApiOkResponse(SignOutAllOkResponse)
    @ApiUnauthorizedResponse(CommonUnauthorizedResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async terminateAllSessions(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<BasicResponse> {
        await this.authService.terminateAllSessionsForUser(activeUser);
        return { message: "All sessions terminated successfully." };
    }

    @Delete(`sign-out/:sessionUuid`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(SignOutSessionOperation)
    @ApiParam(SignOutSessionUuidParam)
    @ApiOkResponse(SignOutSessionOkResponse)
    @ApiUnauthorizedResponse(CommonUnauthorizedResponse)
    @ApiNotFoundResponse(SignOutSessionNotFoundResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async terminateSpecifiedSession(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Param(`sessionUuid`) sessionUuid: string,
    ): Promise<BasicResponse> {
        await this.authService.signOut({ ...activeUser, sessionUuid });
        return { message: `Specified session ${sessionUuid} terminated successfully.` };
    }

    @Post(`password/change`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(ChangePasswordOperation)
    @ApiAcceptedResponse(ChangePasswordAcceptedResponse)
    @ApiBadRequestResponse(ChangePasswordBadRequestResponse)
    @ApiUnauthorizedResponse(ChangePasswordUnauthorizedResponse)
    @ApiForbiddenResponse(ChangePasswordForbiddenResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async changePassword(
        @ActiveUser() activeUser: ActiveUserPayload,
        @Body() payload: PasswordChangeDto,
    ): Promise<void> {
        await this.authService.changePassword(activeUser, payload);
    }

    @Post(`password/reset`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(RequestPasswordResetOperation)
    @ApiAcceptedResponse(RequestPasswordResetAcceptedResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async requestPasswordReset(
        @Body() { login }: GetPasswordResetKeyDto,
    ): Promise<BasicResponse> {
        await this.authService.requestPasswordReset(login);
        return {
            message: "Check your email for the password reset instructions.",
        };
    }

    @Post(`password/reset/confirm`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(ConfirmPasswordResetOperation)
    @ApiAcceptedResponse(ConfirmPasswordResetAcceptedResponse)
    @ApiBadRequestResponse(ConfirmPasswordResetBadRequestResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async confirmPasswordReset(
        @Body() payload: ResetPasswordDto,
    ): Promise<BasicResponse> {
        await this.authService.changePasswordFromCode(payload);
        return {
            message: "Your password has been reset successfully.",
        };
    }

    @Post(`token/refresh`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(RefreshTokenOperation)
    @ApiOkResponse(RefreshTokenOkResponse)
    @ApiBadRequestResponse(RefreshTokenBadRequestResponse)
    @ApiForbiddenResponse(RefreshTokenForbiddenResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async refreshAccessToken(
        @Body() body: RefreshTokenDto,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const credentials = await this.authService.refreshToken(body);
        res.cookie(`accessToken`, credentials.accessToken.value, {
            httpOnly: true,
            secure: true,
            sameSite: `strict`,
            maxAge: parseExpiresIn(credentials.accessToken.expiresIn),
        });
        res.cookie(`refreshToken`, credentials.refreshToken.value, {
            httpOnly: true,
            secure: true,
            sameSite: `strict`,
            path: `/v1/auth/token/refresh`,
            maxAge: parseExpiresIn(credentials.refreshToken.expiresIn),
        });
    }
}
