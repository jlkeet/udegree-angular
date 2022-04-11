/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';
import { AddCourseService } from './add-course';
import * as services from './services';
import { AppHeader } from './app.header.component';



const mapValuesToArray = obj => Object.keys(obj).map(key => obj[key]);

//create providers for all services exported from ./services
export const providers = [ AddCourseService, ...mapValuesToArray(services)];
// this puts the global styles into the head, but any variables defined in this file
// are only used in this file.

require('./app.component.global.scss');

/*
 * App Component
 * Root Level Component
 * 
 */

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app',
  // http://blog.thoughtram.io/angular/2015/06/29/shadow-dom-strategies-in-angular2.html
  // note we use styles property, not styleUrls
  styleUrls: [('./app.component.scss')],
  templateUrl: './app.component.html'
})
export class App {
  public angularclassLogo = 'assets/img/angularclass-avatar.png';
  public name = 'Angular 2 Webpack Starter';
  public url = 'https://twitter.com/AngularClass';
  public isMobile;

  data : any = [];

  constructor(
    private db_courses: AngularFireDatabase,
    private db: AngularFirestore,
    private appHeader: AppHeader

    
    ) {
      this.isMobile = appHeader.mobile;
    }
}




/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
