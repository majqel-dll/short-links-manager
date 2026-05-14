import { ContentComponent, HeaderComponent, FooterComponent } from '@structural/index';
import { Component, HostListener } from '@angular/core';
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
  styleUrls: ['./app.scss']
})
export class App {

  @HostListener('contextmenu', ['$event']) disableContextMenu(event: PointerEvent): void {
    event.preventDefault();
  }

}
