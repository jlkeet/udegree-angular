import { Component, Input } from '@angular/core';
import { Message, MessageStatus } from '../models';

/*
    A component for displaying a notification message
*/

@Component({
    selector: 'notification',
    styles: [`
        .notification {     
            padding: 2px;
            line-height: 18px;
            font-size: 16px; 
        }
    `],
    template:
    `<div class="notification">
    {{message.text}}
    </div>`
})
export class NotificationComponent {
    @Input() message: Message;

    ngOnInit() {
    }
    constructor() { }
}