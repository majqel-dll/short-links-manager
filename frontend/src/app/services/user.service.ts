import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { UserData } from "@models/user.types";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class UserService {

    private authService = inject(AuthService);
    private httpClient = inject(HttpClient);

    constructor() {
        this.authService.isSignedIn.subscribe(isSignedIn => {
            if (!isSignedIn) {
                this.user.next(null);
            } else {
                this.getUserData();
            }
        })
    }

    private async getUserData(): Promise<void> {
        try {

            const data = await firstValueFrom(
                this.httpClient.get<UserData>(`/v1/user`,
                    { withCredentials: true })
            ).catch(error => { throw error });
            console.log(`User data has been fetched.`);
            this.user.next(data);

        } catch (error) {
            console.error(`Failed to get user data:`);
            console.error(error);
            this.user.next(null);
        }
    }

    public async getUserAvatar(): Promise<void> { }

    public async setUserPermissions(): Promise<void> { }

    public async changeUserPassword(): Promise<void> { }

    public async deactivateUser(): Promise<void> { }

    public async setEmailStatus(): Promise<void> { }

    public async sendVerificationEmail(): Promise<void> { }

    public async updateEmailValue(): Promise<void> { }

    public async removeEmailValue(): Promise<void> { }

    public async checkIfActivateCodeExists(): Promise<void> { }

    public async verifyByRequest(): Promise<void> { }

    public async createUserInPanel(): Promise<void> { }

    public async updateUserObject(): Promise<void> { }

    public async setUserAvatar(): Promise<void> { }

    public async deleteUserAvatar(): Promise<void> { }


    public user = new BehaviorSubject<UserData>(null);
}