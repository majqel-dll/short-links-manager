import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { UserData } from "@models/user.types";
import { AuthService } from "./auth.service";
import { ChangePasswordPayload, DeactivateUserPayload } from "@models/payload.types";

@Injectable({ providedIn: 'root' })
export class UserService {

    private authService = inject(AuthService);
    private httpClient = inject(HttpClient);

    public user = new BehaviorSubject<UserData>(null);
    public avatar = new BehaviorSubject<string>(null);

    public otherUsersList = new BehaviorSubject<UserData[]>([]);
    public deleteEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public changeEmailProcess: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public pendingEmail: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    constructor() {
        this.authService.isSignedIn.subscribe(isSignedIn => {
            if (!isSignedIn) {
                this.user.next(null);
                this.avatar.next(null)
            } else {
                this.getUserData();
                this.getUserAvatar();
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

    public async getUserAvatar(): Promise<void> {
        try {

            const arrayBuffer = await firstValueFrom(
                this.httpClient.get(`/v1/user/avatar`,
                    { withCredentials: true, responseType: `blob` })
            ).catch(error => { throw error });
            console.log(`User avatar has been fetched.`);
            const avatar = URL.createObjectURL(arrayBuffer);
            this.avatar.next(avatar);

        } catch (error) {
            console.error(`Failed to get user avatar:`);
            console.error(error);
            this.avatar.next(null);
        }

    }

    public async changeUserPassword(payload: ChangePasswordPayload): Promise<any> {

        try {

            const data = await firstValueFrom(
                this.httpClient.post<UserData>(
                    `/v1/auth/change-password`,
                    payload,
                    { withCredentials: true }
                )
            ).catch(error => { throw error });
            console.log(`Password has been changed.`);
            this.user.next(data);

        } catch (error) {
            console.error(`Failed to change password:`);
            console.error(error);
            this.user.next(null);
        }

    }

    public async deactivateUser(payload: DeactivateUserPayload): Promise<any> {

        try {
            const response = await firstValueFrom(
                this.httpClient.delete<DefaultResponse>(
                    `/v1/user/${payload.id}`,
                    { withCredentials: true }
                )
            ).catch(error => { throw error });

            if (response.status !== 200) {
                return false;
            }
            console.log(`Password has been changed.`);
            this.user.next(data);

        } catch (error) {
            console.error(`Failed to change password:`);
            console.error(error);
            this.user.next(null);
        }

    }

    public async setUserPermissions(): Promise<void> { }

    public async setEmailStatus(): Promise<void> { }

    public async updateEmailValue(): Promise<void> { }

    public async removeEmailValue(): Promise<void> { }

    public async checkIfActivateCodeExists(): Promise<void> { }

    public async createUserInPanel(): Promise<void> { }

    public async updateUserObject(): Promise<void> { }

    public async setUserAvatar(): Promise<void> { }

    public async deleteUserAvatar(): Promise<void> { }

}