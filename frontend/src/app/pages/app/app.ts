import { ContentComponent, HeaderComponent, FooterComponent } from '@structural/index';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [
    ContentComponent,
    FooterComponent,
    HeaderComponent,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('short-link-manager');
}
