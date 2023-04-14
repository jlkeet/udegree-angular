import { IRequirement } from '../services';
import { MessageStatus } from './message-status.enum';

/* an error message */

export class Message {
    name: string;
    text: string;
    status: MessageStatus;
    requirement: IRequirement;

    constructor(name: string, text: string, status: MessageStatus, requirement: IRequirement) {
         this.name = name;
         this.text = text; 
         this.status = status;
         this.requirement = requirement;
        }
}