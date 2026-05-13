import { deleteCookie } from "@utils/delete-cookie.util";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: `root` })
export class AuthService {

    constructor(
        private readonly httpClient: HttpClient,
    ) { }

    public isSignedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    public async signIn(login: string, password: string): Promise<boolean> {
        try {
            await firstValueFrom(
                this.httpClient.post(`/v1/auth/sign-in`, { login, password })
            ).catch(error => { throw error });
            this.isSignedIn.next(true);
            return true;
        } catch (error) {
            console.error(`Failed to sign in:`, error);
            this.isSignedIn.next(false);
            return false;
        }
    }

    public async refreshToken(): Promise<boolean> {
        try {
            await firstValueFrom(
                this.httpClient.post(`/v1/auth/token/refresh`, {}, { withCredentials: true })
            ).catch(error => { throw error });
            this.isSignedIn.next(true);
            console.log(`Token refreshed successfully.`);
            return true;
        } catch (error) {
            console.error(`Failed to refresh token:`);
            console.error(error);
            this.isSignedIn.next(false);
            return false;
        }
    }

    public async signOut(): Promise<boolean> {
        try {
            await firstValueFrom(this.httpClient.delete(`/v1/auth/sign-out`)
            ).catch(error => { throw error });
            this.isSignedIn.next(false);
            deleteCookie(`accessToken`);
            deleteCookie(`refreshToken`, `/v1/auth`);
            return true;
        } catch (error) {
            console.error(`Failed to sign out:`, error);
            this.isSignedIn.next(false);
            return false;
        }
    }

}