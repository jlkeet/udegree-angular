import { Component } from '@angular/core';
import { Store } from '../app.store';
import { Message } from '../models';

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
  `
  ],
  template: `
        <div class='notification-container'>
        <span class="light"> | &nbsp;</span> 
            <notification-icon [messages]='messages' (clicked)='onIconClicked($event)'></notification-icon>
            <notification-list [messages]='messages' [show]='showMessages'></notification-list>
        </div>
  `
})
export class NotificationContainer {
  private messages: Message[] = [];
  private showMessages: boolean = false;

  constructor(private store: Store) {}

  public onIconClicked() {
    this.showMessages = !this.showMessages;
  }

  public ngOnInit() {
    this.store.changes.pluck('messages').subscribe((messages: Message[]) => {
      this.messages = messages;
    });
  }

}
