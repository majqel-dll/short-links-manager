import { MenuComponent } from "@structural/menu/menu";
import { AuthService } from "@services/auth.service";
import { Component, inject } from "@angular/core";

@Component({
    selector: `app-content`,
    templateUrl: `./content.html`,
    styleUrls: [`./content.scss`],
    imports: [
        MenuComponent,
    ]
})

export class ContentComponent {

    private authService: AuthService = inject(AuthService);
    protected isSignedIn: boolean = false;
    
    constructor() {
        this.authService.isSignedIn.subscribe(isSignedIn => {
            this.isSignedIn = isSignedIn;
        });
    }

}