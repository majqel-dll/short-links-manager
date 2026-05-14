import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AppAssetsService } from "@services/assets.service";
import { AuthService } from "@services/auth.service";
import { Component, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { map, Observable, startWith } from "rxjs";
@Component({
    selector: `app-header`,
    templateUrl: `./header.html`,
    styleUrls: [`./header.scss`],
    imports: [CommonModule, RouterLinkActive, RouterLink],
})

export class HeaderComponent {

    private assets: AppAssetsService = inject(AppAssetsService);
    private authService: AuthService = inject(AuthService);
    private router = inject(Router);

    protected showSignInLink$: Observable<boolean> = this.router.events.pipe(
        startWith(null),
        map((event) => {
            const currentUrl = event instanceof NavigationEnd
                ? event.urlAfterRedirects
                : this.router.url;
            return !currentUrl.includes('sign-in') && !currentUrl.includes('sign-up');
        })
    );
    protected appName = this.assets.appName;
    protected isSignedIn: boolean = false;

    constructor() {

        this.authService.isSignedIn.subscribe(isSignedIn => {
            this.isSignedIn = isSignedIn;
        });
    }

    public async signOut(): Promise<void> {
        await this.authService.signOut();
        this.router.navigate(['/']);
    }

}