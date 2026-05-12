import { MenuComponent } from "@structural/menu/menu";
import { Component, OnDestroy } from "@angular/core";
import { AuthService } from "@services/auth.service";
import { Subscription } from "rxjs";

@Component({
    selector: `app-content`,
    templateUrl: `./content.html`,
    styleUrl: `./content.scss`,
    imports: [
        MenuComponent,
    ]
})

export class ContentComponent implements OnDestroy {

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