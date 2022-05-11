import { OnChanges, SimpleChange, Component, Input } from '@angular/core';
import { CourseEventService } from '../services';
import { Message, MessageStatus } from '../models';


/*
    A component for displaying a list of notification messages
*/

@Component({
    selector: 'notification-list',
    styles: [`
    :host {  flex: 1; }
    .notification-list {
        display: block;
        position: absolute;
        top: 35px;
        right: 0;
        border: 3px solid #46b7cc;
        background: #8cfeff;
        margin-bottom: 5px;
        overflow-y: auto;
        border-radius: 3px;
        padding-right: 5px;
        z-index: 10;
        width: 500px;
        max-height: 600px;
}
    .notification-list--error{
        border-color: Maroon;
        background-color: Linen;
        color: Maroon;
    }
    .notification-list--warning { 
        border-color: goldenRod ; 
        background-color: lightgoldenrodyellow;
        color: goldenRod;
    }
    .notification-list--ok { 
        border-color: #46b7cc; 
        background-color: #E0FFFF;
        color: #46b7cc;
    }

    @media (max-width: 415px) {
        .notification-list {
            right: -98px;
            width: 374px;
    }

    }
    `],
    template:
    `<div *ngIf="show" class="notification-list" [ngClass]="borderClass">
        <notification *ngFor="let msg of messages; let i = index" class="message" [message]="msg"></notification>
    </div>`
})
export class NotificationListComponent {

    @Input() messages: Message[] = [];
    @Input() show: boolean = false;

    public borderClass: string;


    ngOnInit() {
        this.configureColours();
    }

    ngOnChanges(changes: { [value: string]: SimpleChange }) {
        if (changes['messages'] && this.messages != undefined) {

            this.configureColours();


        }
    }

    constructor(public courseEventService: CourseEventService) { }

    public configureColours() {

        var errorMessageCount = this.messages.filter((message) => {
            return message.status === MessageStatus.Error;
        }).length;

        var warningMessageCount = this.messages.filter((message) => {
            return message.status === MessageStatus.Warning;
        }).length;

        if (errorMessageCount > 0) {
            this.borderClass = 'notification-list--error';
        }
        else if (warningMessageCount > 0) {
            this.borderClass = 'notification-list--warning';
        }
        else {
            this.borderClass = 'notification-list--ok';
        }
    }

    
}