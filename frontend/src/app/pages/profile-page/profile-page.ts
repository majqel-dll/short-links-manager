import { PermissionService, UserService } from "@services/index";
import { Component, inject } from "@angular/core";

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.html',
    styleUrls: ['./profile-page.scss'],
})

export class ProfilePage {

    protected permissionService = inject(PermissionService);
    protected userService = inject(UserService);


}