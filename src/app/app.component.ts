/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { AddCourseService } from './add-course';
import { AppReadyEvent } from './app.ready.event';
import { AppState } from './app.service';
import * as services from './services';

const mapValuesToArray = obj => Object.keys(obj).map(key => obj[key]);

//create providers for all services exported from ./services
export const providers = [ AddCourseService, ...mapValuesToArray(services)];
// this puts the global styles into the head, but any variables defined in this file
// are only used in this file.

require('./app.component.global.scss');

/*
 * App Component
 * Root Level Component
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app',
  // http://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html
  // note we use styles property, not styleUrls
  styles: [require('./app.component.scss')],
  template: require('./app.component.html')
})
export class App {
  public angularclassLogo = 'assets/img/angularclass-avatar.png';
  public name = 'Angular 2 Webpack Starter';
  public url = 'https://twitter.com/AngularClass';

  constructor(
    public appState: AppState,
    private appReadyEvent: AppReadyEvent
  ) {}

  public ngOnInit() {
    this.appReadyEvent.trigger();
  }
}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
