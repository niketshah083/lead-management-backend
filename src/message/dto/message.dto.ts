import { MessageDirection, MessageStatus, MediaType } from '../../common/enums';

export class MessageDto {
  id: string;
  leadId: string;
  direction: MessageDirection;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  sentById?: string;
  sentByName?: string;
  status: MessageStatus;
  isAutoReply: boolean;
  createdAt: Date;
}
