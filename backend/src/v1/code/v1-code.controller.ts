import { BasicResponse, RedirectResponse, type ActiveUserPayload } from "@libs/types";
import { AuthGuard, PermissionGuard } from "@libs/guards";
import { ActiveUser, Auth } from "@libs/decorators";
import { GetCodeQueryParamsDto } from "@libs/dtos";
import { V1CodeService } from "./v1-code.service";
import {
    CommonCodeBadRequestResponse,
    CommonCodeForbiddenResponse,
    CommonCodeInternalServerErrorResponse,
    CommonCodeTooManyRequestsResponse,
    CommonCodeUnauthorizedResponse,
    ConfirmUserByActivationCodeAcceptedResponse,
    ConfirmUserByActivationCodeOperation,
    ConfirmUserByActivationCodeParam,
    GetActiveCodesForUserEventQuery,
    GetActiveCodesForUserIdParam,
    GetActiveCodesForUserOkResponse,
    GetActiveCodesForUserOperation,
    SendVerificationCodeToEmailOkResponse,
    SendVerificationCodeToEmailOperation,
} from "./v1-code.controller.swagger";
import {
    ClassSerializerInterceptor,
    ForbiddenException,
    UseInterceptors,
    Controller,
    HttpStatus,
    UseGuards,
    Redirect,
    HttpCode,
    Param,
    Query,
    Get,
} from "@nestjs/common";
import { AuthTypeEnum } from "@libs/enums";
import { CodeEntity } from "@libs/entities";
import {
    ApiInternalServerErrorResponse,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
    ApiAcceptedResponse,
    ApiForbiddenResponse,
    ApiBearerAuth,
    ApiCookieAuth,
    ApiBadRequestResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiOkResponse,
    ApiTags,
} from "@nestjs/swagger";

@ApiTags("Code")
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
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation(GetActiveCodesForUserOperation)
    @ApiParam(GetActiveCodesForUserIdParam)
    @ApiQuery(GetActiveCodesForUserEventQuery)
    @ApiOkResponse(GetActiveCodesForUserOkResponse)
    @ApiUnauthorizedResponse(CommonCodeUnauthorizedResponse)
    @ApiForbiddenResponse(CommonCodeForbiddenResponse)
    @ApiInternalServerErrorResponse(CommonCodeInternalServerErrorResponse)
    public async findActiveCodeForUser(
        @Query() { event }: GetCodeQueryParamsDto,
        @Param(`id`) userId: number,
        @ActiveUser() activeUser: ActiveUserPayload,
    ): Promise<CodeEntity[]> {
        if (activeUser.id !== userId) {
            throw new ForbiddenException(`You don't have permission to view codes of other users.`);
        }
        return await this.codeService.findActiveCodeForUser(userId, event);
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
        return { url: `${process.env.ORIGIN}/panel/account`, status: 202 }
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
        const wasCodeSend: boolean = await this.codeService.sendVerificationCodeToEmail(activeUser);
        return wasCodeSend
            ? { message: "Verification code sent successfully." }
            : { message: "Failed to send verification code." };
    }
}
