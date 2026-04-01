import { Controller, Post } from "@nestjs/common";

@Controller(`v1/permission`)
export class V1PermissionController {
    @Post(`user/:id/assign`)
    public async assignPermissionToUser() {}

    @Post(`user/:id/detach`)
    public async detachPermissionFromUser() {}
}
