import { OnChanges, SimpleChange, Component, Input, Output, EventEmitter } from '@angular/core';
import { Message, MessageStatus }from '../models';
import { GoogleAnalyticsService } from '../services/google-analytics.service';

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
    @media (max-width: 415px) {
    .notification-icon-badge-container {
        position: absolute;
        top: -16px;
        right: 12px;
    }
}

    .notification-icon-badge-container:hover {
        position: absolute;
        top: -16px;
        right: -5px;
    }

    .notification-icon-badge {
        border-radius: 100%;
        padding: 2px 6px;
        background: red;
        border: 1px solid red;
        color: #fff;
        text-align: center;
        font-size: 12px;
     }

     .imgWrap {
        display: inline-block;
    }
    
    .imgWrap:hover {
        background-color: #e6eaed;
    }
     
  `],  
  template: ` 
            <div (click)="onClicked();newNotificationEvent()" class="notification-icon">
            <span class="imgWrap">
                <img src="../../assets/img/file.svg" class="icon" alt="errors"/>
            </span>    
                <span class="notification-icon-badge-container">
                    <span *ngIf="messageCount > 0" class="notification-icon-badge">{{messageCount}}</span>
                </span>
            </div>`,
})

export class NotificationIconComponent {
  
  @Output() clicked = new EventEmitter();
  @Input() messages: Message[] = [];

    public messageCount: number = 0;

    onClicked() {
    if (this.messageCount > 0) {
        this.clicked.emit({ });  
        }
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
    constructor(public googleAnalyticsService: GoogleAnalyticsService) { }

    newNotificationEvent(){ 
        this
        .googleAnalyticsService
        .eventEmitter("check_notification", "notification-icon", "notification", "click", 10);
      } 
}


