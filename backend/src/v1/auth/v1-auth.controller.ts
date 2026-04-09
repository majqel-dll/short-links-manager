import { PasswordChangeDto, RefreshTokenDto, SignInDto, SignUpDto } from "@libs/dtos";
import { type ActiveUserPayload, SignInResponse } from "@libs/types";
import { type SessionEntity } from "@libs/entities";
import { ActiveUser, Auth } from "@libs/decorators";
import { V1AuthService } from "./v1-auth.service";
import { AuthTypeEnum } from "@libs/enums";
import { AuthGuard } from "@libs/guards";
import { type Response } from "express";
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
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiAcceptedResponse,
} from "@nestjs/swagger";
import {
    ChangePasswordBadRequestResponse,
    ChangePasswordForbiddenResponse,
    ChangePasswordAcceptedResponse,
    ChangePasswordOperation,
    ChangePasswordUnauthorizedResponse,
    CommonInternalServerErrorResponse,
    CommonUnauthorizedResponse,
    GetSessionsOkResponse,
    GetSessionsOperation,
    RefreshTokenBadRequestResponse,
    RefreshTokenForbiddenResponse,
    RefreshTokenOkResponse,
    RefreshTokenOperation,
    SignInAcceptedResponse,
    SignInOperation,
    SignInUnauthorizedResponse,
    SignOutAllOkResponse,
    SignOutAllOperation,
    SignOutNotFoundResponse,
    SignOutOkResponse,
    SignOutOperation,
    SignOutSessionNotFoundResponse,
    SignOutSessionOkResponse,
    SignOutSessionOperation,
    SignOutSessionUuidParam,
    SignUpConflictResponse,
    SignUpCreatedResponse,
    SignUpOperation,
} from "./v1-auth.controller.swagger";

@ApiTags("Auth")
@Controller(`v1/auth`)
@UseGuards(AuthGuard)
export class V1AuthController {
    constructor(private readonly authService: V1AuthService) {}

    @Get(`sessions`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @UseInterceptors(ClassSerializerInterceptor)
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
    @ApiOperation(SignUpOperation)
    @ApiCreatedResponse(SignUpCreatedResponse)
    @ApiConflictResponse(SignUpConflictResponse)
    @ApiInternalServerErrorResponse(CommonInternalServerErrorResponse)
    public async signUp(@Body() body: SignUpDto): Promise<{ message: string }> {
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
    ): Promise<{ message: string }> {
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
    ): Promise<{ message: string }> {
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
    ): Promise<{ message: string }> {
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
    ): Promise<SignInResponse> {
        const credentials = await this.authService.refreshToken(body);
        res.cookie(`accessToken`, credentials.accessToken.value, {
            httpOnly: true,
            secure: true,
            sameSite: `strict`,
        });
        return credentials;
    }
}
