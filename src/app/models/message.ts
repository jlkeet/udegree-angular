import { IRequirement } from '../services';
import { MessageStatus } from './message-status.enum';

/* an error message */

export class Message {
    name: string;
    text: string;
    status: MessageStatus;

    constructor(name: string, text: string, status: MessageStatus) {
         this.name = name;
         this.text = text; 
         this.status = status;
        }
}