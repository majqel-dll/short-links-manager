import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { AppAssetsService } from "@services/assets.service";
import { AuthService } from "@services/auth.service";
import { CommonModule } from '@angular/common';
import { Subscription } from "rxjs";

@Component({
    selector: `app-header`,
    templateUrl: `./header.html`,
    styleUrls: [`./header.scss`],
    imports: [CommonModule],
})

export class HeaderComponent implements OnDestroy, OnInit {

    public assets: AppAssetsService = inject(AppAssetsService);
    public authService: AuthService = inject(AuthService);
    public appName = this.assets.appName;

    private subscription: Subscription = null;
    protected isSignedIn = false;

    public ngOnInit(): void {
        this.subscription = this.authService.isSignedIn.subscribe(isSignedIn => {
            this.isSignedIn = isSignedIn;
        });
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    };

}