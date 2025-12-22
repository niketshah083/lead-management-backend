import { MessageDirection, MessageStatus, MediaType } from '../enums';
import { UserDto } from './user.dto';
export declare class MessageDto {
    id: string;
    leadId: string;
    direction: MessageDirection;
    content: string;
    mediaUrl?: string;
    mediaType?: MediaType;
    sentById?: string;
    sentBy?: UserDto;
    status: MessageStatus;
    isAutoReply: boolean;
    createdAt: Date;
}
export declare class SendMessageDto {
    content: string;
}
