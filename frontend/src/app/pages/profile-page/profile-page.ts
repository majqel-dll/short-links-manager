import { PermissionService, UserService } from "@services/index";
import { Component, inject } from "@angular/core";
import { UserData } from "@models/user.types";

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.html',
    styleUrls: ['./profile-page.scss'],
})

export class ProfilePage {

    protected permissionService = inject(PermissionService);
    protected userService = inject(UserService);

    protected user: UserData | null = null;
    protected editMode: boolean = false;

    constructor() {
        this.userService.user.subscribe(user => {
            this.user = user;
        })
    }

}