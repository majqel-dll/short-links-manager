import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import {
    PermissionsResponse,
    PermissionItem,
    RolesResponse,
    RoleItem,
} from "@models/permission.types";



@Injectable({ providedIn: `root` })
export class PermissionService {

    private authService = inject(AuthService);
    private httpClient = inject(HttpClient);

    constructor() {
        this.authService.isSignedIn.subscribe(isSignedIn => {
            if (!isSignedIn) {
                this.permissions.clear();
                this.roles.clear();
            } else {
                this.getUserRoles();
                this.getUserPermissions();
            }
        })
    }

    private async getUserRoles(): Promise<void> {

        try {

            const response = await firstValueFrom(
                this.httpClient.get<RolesResponse>(`/v1/permission/roles`,
                    { withCredentials: true })
            ).catch(error => { throw error });

            this.roles = new Set(response.data.map(({ name }: RoleItem) => (name)));

        } catch (error) {
            console.error(`Failed to get user roles list.`)
            console.error(error);
        }
    }

    private async getUserPermissions(): Promise<void> {
        try {

            const response = await firstValueFrom(
                this.httpClient.get<PermissionsResponse>(`/v1/permission`, { withCredentials: true })
            ).catch(error => { throw error });

            this.permissions = new Set(response.data.map(({ value }: PermissionItem) => (value)));

        } catch (error) {
            console.error(`Failed to get user permissions list.`)
            console.error(error);
        }
    }

    public permissions: Set<string> = new Set();
    public roles: Set<string> = new Set();

}