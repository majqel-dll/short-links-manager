import { BasicResponse, RedirectResponse, type ActiveUserPayload } from "@libs/types";
import { AuthTypeEnum, CodeActionEnum } from "@libs/enums";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { ActiveUser, Auth } from "@libs/decorators";
import { GetCodeQueryParamsDto } from "@libs/dtos";
import { V1CodeService } from "./v1-code.service";
import {
    ConfirmUserByActivationCodeAcceptedResponse,
    SendVerificationCodeToEmailOkResponse,
    CommonCodeInternalServerErrorResponse,
    ConfirmUserByActivationCodeOperation,
    SendVerificationCodeToEmailOperation,
    CommonCodeTooManyRequestsResponse,
    ConfirmUserByActivationCodeParam,
    GetActiveCodesForUserOkResponse,
    CommonCodeUnauthorizedResponse,
    GetActiveCodesForUserOperation,
    GetActiveCodesForUserIdParam,
    CommonCodeBadRequestResponse,
    CommonCodeForbiddenResponse,
} from "./v1-code.controller.swagger";
import { CodeEntity } from "@libs/entities";
import {
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiAcceptedResponse,
    ApiOkResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import {
    ClassSerializerInterceptor,
    UseInterceptors,
    Controller,
    HttpStatus,
    UseGuards,
    Redirect,
    HttpCode,
    Param,
    Get,
} from "@nestjs/common";

@ApiTags("Code")
@Controller(`v1/code`)
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, PermissionGuard)
export class V1CodeController {
    constructor(private readonly codeService: V1CodeService) {}

    @Get(`:action`)
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(GetActiveCodesForUserOperation)
    @ApiParam(GetActiveCodesForUserIdParam)
    @ApiOkResponse(GetActiveCodesForUserOkResponse)
    @ApiUnauthorizedResponse(CommonCodeUnauthorizedResponse)
    @ApiForbiddenResponse(CommonCodeForbiddenResponse)
    @ApiInternalServerErrorResponse(CommonCodeInternalServerErrorResponse)
    public async findActiveCodeForUser(
        @Param() { action }: GetCodeQueryParamsDto,
        @ActiveUser() { id }: ActiveUserPayload,
    ): Promise<CodeEntity[]> {
        return await this.codeService.findActiveCodeForUser(id, action);
    }

    @Get(`:code/confirm`)
    @HttpCode(HttpStatus.ACCEPTED)
    @Redirect()
    @Auth(AuthTypeEnum.NONE)
    @ApiOperation(ConfirmUserByActivationCodeOperation)
    @ApiParam(ConfirmUserByActivationCodeParam)
    @ApiAcceptedResponse(ConfirmUserByActivationCodeAcceptedResponse)
    @ApiBadRequestResponse(CommonCodeBadRequestResponse)
    @ApiInternalServerErrorResponse(CommonCodeInternalServerErrorResponse)
    public async confirmUserByActivationCode(
        @Param(`code`) code: string,
    ): Promise<RedirectResponse> {
        await this.codeService.activateUserWithCode(code);
        return { url: `${process.env.ORIGIN}/panel/account`, status: 202 };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @Auth(AuthTypeEnum.BEARER, AuthTypeEnum.COOKIE)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(SendVerificationCodeToEmailOperation)
    @ApiOkResponse(SendVerificationCodeToEmailOkResponse)
    @ApiUnauthorizedResponse(CommonCodeUnauthorizedResponse)
    @ApiForbiddenResponse(CommonCodeForbiddenResponse)
    @ApiTooManyRequestsResponse(CommonCodeTooManyRequestsResponse)
    @ApiInternalServerErrorResponse(CommonCodeInternalServerErrorResponse)
    public async sendVerificationCodeToEmail(
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<BasicResponse> {
        const wasCodeSend: boolean = await this.codeService.sendVerificationCodeToEmail(
            activeUser,
            CodeActionEnum.VERIFY_EMAIL,
        );
        return wasCodeSend
            ? { message: "Verification code sent successfully." }
            : { message: "Failed to send verification code." };
    }
}
