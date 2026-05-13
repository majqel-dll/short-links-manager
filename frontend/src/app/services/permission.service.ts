import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { UserService } from "./user.service";
import {
    PermissionsResponse,
    PermissionItem,
    RolesResponse,
    RoleItem,
} from "@models/permission.types";

@Injectable({ providedIn: `root` })
export class PermissionService {

    private userService = inject(UserService);
    private httpClient = inject(HttpClient);

    constructor() {
        this.userService.user.subscribe(user => {
            if (!user) {
                this.permissions.clear();
                this.roles.clear();
            } else {
                this.getUserRoles();
                this.getUserPermissions();
            }
        });
    }

    private async getUserRoles(): Promise<void> {
        try {

            const data = await firstValueFrom(
                this.httpClient.get<RolesResponse>(`/v1/user/roles`,
                    { withCredentials: true })
            ).catch(error => { throw error });
            this.roles = new Set(data.map(({ name }: RoleItem) => (name)));
            console.log(`User roles has been fetched.`);

        } catch (error) {
            console.error(`Failed to get user roles list.`)
            console.error(error);
        }
    }

    private async getUserPermissions(): Promise<void> {
        try {

            const data = await firstValueFrom(
                this.httpClient.get<PermissionsResponse>(`/v1/user/permissions`, { withCredentials: true })
            ).catch(error => { throw error });
            this.permissions = new Set(data.map(({ value }: PermissionItem) => (value)));
            console.log(`User permissions has been fetched.`);

        } catch (error) {
            console.error(`Failed to get user permissions list.`)
            console.error(error);
        }
    }

    public permissions: Set<string> = new Set();
    public roles: Set<string> = new Set();

}