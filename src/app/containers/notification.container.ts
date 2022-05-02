import { Component } from '@angular/core';
import { Store } from '../app.store';
import { Message } from '../models';
import { AppHeader } from '../app.header.component';

/*
  Container for notifications.
*/
@Component({
  selector: 'notification-container',
  styles: [
    `
        .notification-container {
          display: inline-block;
          position: relative;
          top: 10px;
          z-index:99;
        }

        .light {
          color: #ddd;
          top: 10px;
          float: left;
        }


        .notification-container-mobile {
          position: relative;
          z-index:99;
        }

        .light-mobile {
          color: #ddd;
          top: 10px;
        }

        .notification-icon-mobile {
          float: left;
        }
  `
  ],
  template: `
        <div *ngIf="!isMobile" class='notification-container'>
        <span class="light"> | &nbsp;</span> 
            <notification-icon [messages]='messages' (clicked)='onIconClicked($event)'></notification-icon>
            <notification-list [messages]='messages' [show]='showMessages'></notification-list>
        </div>

        <div *ngIf="isMobile" class='notification-container-mobile'>
        <span class="light-mobile">&nbsp;|&nbsp;</span>
        <div class="notification-icon-mobile"> 
            <notification-icon [messages]='messages' (clicked)='onIconClicked($event)'></notification-icon>
            <notification-list [messages]='messages' [show]='showMessages'></notification-list>
        </div>

        </div>
  `
})
export class NotificationContainer {
  public messages: Message[] = [];
  public showMessages: boolean = false;
  public isMobile;

  constructor(public store: Store, public appHeader: AppHeader) {
    this.isMobile = appHeader.mobile;
  }

  public onIconClicked() {
    this.showMessages = !this.showMessages;
  }

  public ngOnInit() {
    this.store.changes.pluck('messages').subscribe((messages: Message[]) => {
      this.messages = messages;
    });
  }

}
