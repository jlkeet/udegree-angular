import { IRequirement } from '../services';
import { MessageStatus } from './message-status.enum';

/* an error message */

export class Message {
    id: string;
    text: string;
    status: MessageStatus;

    constructor(id: string, text: string, status: MessageStatus) {
         this.id = id;
         this.text = text; 
         this.status = status;
        }
}