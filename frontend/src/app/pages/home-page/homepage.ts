import { Component } from '@angular/core';
import { SignInFormComponent } from '@functional/sign-in-form/sign-in-form';

@Component({
  selector: 'app-homepage',
  imports: [SignInFormComponent],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss', '../sign-in-page/sign-in-page.scss'],
})
export class Homepage {

}