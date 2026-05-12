import { RouterLink, RouterLinkActive } from "@angular/router";
import { FooterSection } from "@models/footer-media.types";
import { Component, inject } from "@angular/core";
import { AppAssetsService } from "@services/assets.service";

@Component({
    selector: `app-footer`,
    imports: [
        RouterLink,
        RouterLinkActive,
    ],
    templateUrl: `./footer.html`,
    styleUrls: [`./footer.scss`],
})

export class FooterComponent {

    public assets: AppAssetsService = inject(AppAssetsService);
    public year = this.assets.year;
    public footerContent = this.assets.footerContent;
    
}