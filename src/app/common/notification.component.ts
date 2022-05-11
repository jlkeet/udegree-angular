import { Component, Input } from '@angular/core';
import { Message, MessageStatus } from '../models';
import { ErrorRequirementService } from '../services/error.requirement.service';


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
        .notification:hover {
            cursor: pointer;
            background-color: #D4BBA3;
    `],
    template:
    `<div class="notification" (click)="this.errorReqService.getCourse(this.message)">
    {{message.text}}
    </div>`
})
export class NotificationComponent {
    @Input() message: Message;
    constructor(
        public errorReqService: ErrorRequirementService
    ) { 

    }
}