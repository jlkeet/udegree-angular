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
          z-index:99;
        }
  `
  ],
  template: `
        <div class='notification-container'>
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
      console.log(messages);
      this.messages = messages;
    });
  }

}
