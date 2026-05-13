import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AppAssetsService } from "@services/assets.service";
import { AuthService } from "@services/auth.service";
import { Component, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { filter, map, Observable } from "rxjs";
@Component({
    selector: `app-header`,
    templateUrl: `./header.html`,
    styleUrls: [`./header.scss`],
    imports: [CommonModule, RouterLinkActive, RouterLink],
})

export class HeaderComponent {

    private assets: AppAssetsService = inject(AppAssetsService);
    private authService: AuthService = inject(AuthService);
    private location = inject(Location);
    private router = inject(Router);

    showSignInLink$: Observable<boolean> = this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(({ urlAfterRedirects }) => {
            return !urlAfterRedirects.includes('sign-in') && !urlAfterRedirects.includes('sign-up');
        })
    );
    protected appName = this.assets.appName;
    protected isSignedIn: boolean = false;

    constructor() {

        this.authService.isSignedIn.subscribe(isSignedIn => {
            this.isSignedIn = isSignedIn;
        });

        this.location.subscribe((location) => {
            console.log(location)
        })
    }

    public async signOut(): Promise<void> {
        await this.authService.signOut();
        this.router.navigate(['/']);
    }

}