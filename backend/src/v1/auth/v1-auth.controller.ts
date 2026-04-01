import { Controller, Delete, HttpCode, HttpStatus, Post } from "@nestjs/common";

@Controller(`v1/auth`)
export class V1AuthController {

    @Post(`sign-in`)
    @HttpCode(HttpStatus.ACCEPTED)
    public async signIn() {

    }

    @Post(`sign-up`)
    @HttpCode(HttpStatus.CREATED)
    public async signUp() {

    }

    @Post(`password/change`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async changePassword() {

    }

    @Post(`token/refresh`)
    @HttpCode(HttpStatus.OK)
    public async refreshAccessToken() {

    }

    @Delete(`token`)
    @HttpCode(HttpStatus.NO_CONTENT)
    public async terminateSession() {

    }

}