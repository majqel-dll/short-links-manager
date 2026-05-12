import { AppAssetsService } from "@services/assets.service";
import { Component, inject, OnDestroy } from "@angular/core";
import { CommonModule } from '@angular/common';
import { AuthService } from "@services/index";
import { Subscription } from "rxjs";

@Component({
    imports: [CommonModule],
    selector: `app-header`,
    templateUrl: `./header.html`,
    styleUrls: [`./header.scss`],
})

export class HeaderComponent implements OnDestroy {

    public assets: AppAssetsService = inject(AppAssetsService);
    public appName = this.assets.appName;

    private subscription: Subscription = null;
    protected isSignedIn = false;

    constructor(
        private readonly authService: AuthService
    ) {
        this.subscription = this.authService.isSignedIn.subscribe(isSignedIn => {
            this.isSignedIn = isSignedIn;
        });

    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    };

}