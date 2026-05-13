import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

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

            const response = await firstValueFrom(
                this.httpClient.get<Record<string, unknown>>(`/v1/user`,
                    { withCredentials: true })
            ).catch(error => { throw error });
            this.user.next(response);

        } catch (error) {
            console.error(`Failed to get user data:`);
            console.error(error);
            this.user.next(null);
        }
    }

    public user = new BehaviorSubject<Record<string, unknown>>(null);

}