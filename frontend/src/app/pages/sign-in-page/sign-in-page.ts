import { SignInFormComponent } from '@functional/sign-in-form/sign-in-form';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in-page',
  imports: [SignInFormComponent, RouterLink],
  templateUrl: './sign-in-page.html',
  styleUrls: ['./sign-in-page.scss'],
})
export class SignInPage {

}