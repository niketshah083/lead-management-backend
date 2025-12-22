import { MessageDirection, MessageStatus, MediaType } from '../common/enums';
import { Lead } from './lead.entity';
import { User } from './user.entity';
export declare class Message {
    id: string;
    leadId: string;
    lead: Lead;
    direction: MessageDirection;
    content: string;
    mediaUrl: string;
    mediaType: MediaType;
    sentById: string;
    sentBy: User;
    status: MessageStatus;
    isAutoReply: boolean;
    createdAt: Date;
}
