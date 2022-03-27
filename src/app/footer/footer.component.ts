
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  // Fill out application configuration in src/config
  public title: string;
  public company: string;
  public author: string;
  public email: string;
  public year: number;
  public website: string;
  public street: string;
  public city: string;
  public state: string;
  public zip: string;
  public country: string;

  constructor() {
  }

  ngOnInit() {
  }

}