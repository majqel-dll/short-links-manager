import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { UserData } from "@models/user.types";

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

    public user = new BehaviorSubject<UserData>(null);
}