import { ActivatedRoute } from '@angular/router';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  imports: [],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {

  private readonly route = inject(ActivatedRoute);
  public requestedRedirection: string = null;


  constructor() {

    this.route.queryParamMap.subscribe((params) => {
      this.requestedRedirection = params.get('r');
    });

  }

}