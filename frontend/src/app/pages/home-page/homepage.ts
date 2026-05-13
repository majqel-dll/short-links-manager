import { SignInFormComponent } from '@functional/sign-in-form/sign-in-form';
import { ViewportScroller } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-homepage',
  imports: [SignInFormComponent, RouterLink],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss', '../sign-in-page/sign-in-page.scss'],
})
export class Homepage {

  protected readonly viewportScroller = inject(ViewportScroller);

  public scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });
  }

}