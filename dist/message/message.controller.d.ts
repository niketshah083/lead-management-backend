import { MessageService } from './services';
import { SendMessageDto, PaginationDto } from './dto';
import { S3Service } from '../common/services';
import { MediaType, MessageDirection, MessageStatus } from '../common/enums';
import { ChatGateway } from './gateways/chat.gateway';
export declare class MessageController {
    private readonly messageService;
    private readonly s3Service;
    private readonly chatGateway;
    constructor(messageService: MessageService, s3Service: S3Service, chatGateway: ChatGateway);
    getConversation(leadId: string, pagination: PaginationDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    send(leadId: string, dto: SendMessageDto, req: any): Promise<any>;
    findOne(id: string): Promise<import("../entities").Message | null>;
    testNotification(leadId: string): Promise<{
        message: string;
        leadId: string;
        testMessage: {
            id: string;
            leadId: string;
            direction: MessageDirection;
            content: string;
            status: MessageStatus;
            isAutoReply: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    uploadMedia(file: Express.Multer.File): Promise<{
        url: string;
        key: string;
        mediaType: MediaType;
        filename: string;
        size: number;
    }>;
}
