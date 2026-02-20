import { Controller, Delete, Post } from "@nestjs/common";

@Controller(`v1/auth`)
export class V1AuthController {

    @Post(`sign-in`)
    public async signIn() {

    }

    @Post(`sign-up`)
    public async signUp() {

    }

    @Post(`password/change`)
    public async changePassword() {

    }

    @Post(`token/refresh`)
    public async refreshAccessToken() {

    }

    @Delete(`token`)
    public async terminateSession() {

    }

}