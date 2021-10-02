import { OnChanges, SimpleChange, Component, Input, Output, EventEmitter } from '@angular/core';
import { CourseEventService } from '../services';
import { Message, MessageStatus }from '../models';
import { Store } from '../app.store';

/*
    A component for displaying a notification icon.
*/

@Component({
  selector: 'notification-icon',
  styles: [`
    .notification-icon img {
        height: 24px;
        width: 24px;
        cursor: pointer;
    }  
    .notification-icon-badge-container {
        position: absolute;
        top: -16px;
        right: -5px;
    }

    .notification-icon-badge {
        border-radius: 100%;
        padding: 1px 6px;
        background: red;
        border: 1px solid red;
        color: #fff;
        text-align: center;
        font-size: 12px;
     }    
  `],  
  template: ` 
            <div (click)="onClicked()" class="notification-icon">
                <img src="../../assets/img/file.svg" class="icon" alt="errors"/>
                <span class="notification-icon-badge-container">
                    <span *ngIf="messageCount > 0" class="notification-icon-badge">{{messageCount}}</span>
                </span>
            </div>`,
})

export class NotificationIconComponent {
  
  @Output() clicked = new EventEmitter();
  @Input() messages: Message[] = [];

    private messageCount: number = 0;

    onClicked() {
        this.clicked.emit({ });  
    }

    ngOnInit() {}

    ngOnChanges(changes: { [value: string]: SimpleChange }) {
        if (changes['messages'] && this.messages != undefined) {

            var errorMessageCount = this.messages.filter((message)=> {
                return message.status === MessageStatus.Error;
            }).length;

            var warningMessageCount = this.messages.filter((message)=> {
                return message.status === MessageStatus.Warning;
            }).length;

            this.messageCount = errorMessageCount + warningMessageCount;
        }
    }
    constructor() { }
}


