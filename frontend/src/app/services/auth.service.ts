import { BehaviorSubject, firstValueFrom, interval, Subscription } from "rxjs";
import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: `root` })
export class AuthService implements OnDestroy {

    constructor(
        private readonly httpClient: HttpClient,
    ) {

        console.log("test")

     }


    public async signIn(login: string, password: string): Promise<void> {

        const response = await firstValueFrom(this.httpClient.post<{ validity: string }>(`/api/auth/sign-in`, { login, password }));

    }

    public isSignedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);



    ngOnDestroy(): void {

    }


}