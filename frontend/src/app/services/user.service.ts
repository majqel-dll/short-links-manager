import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class UserService {

    private authService = inject(AuthService);
    private httpClient = inject(HttpClient);

    constructor() {
        this.authService.isSignedIn.subscribe(isSignedIn => {
            if (!isSignedIn) {
                this.user = null;
            } else {
                // this.getUserData();
            }
        })
    }

    private async getUserData(): Promise<Record<string, unknown>> {
        try {

            const response = await firstValueFrom(
                this.httpClient.get<{ data: Record<string, unknown> }>(`v1/user`,
                    { withCredentials: true })
            ).catch(error => { throw error });


            console.debug(response.data)

            console.log(`i was here`);
            return response.data as unknown as Record<string, unknown>;

        } catch (error) {
            console.error(`Failed to get user data:`);
            console.error(error);
            return null;
        }
    }

    public user: Record<string, unknown> = null;

}