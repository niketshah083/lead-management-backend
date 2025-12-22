import { Repository } from 'typeorm';
import { Message, Lead } from '../../entities';
import { WhatsAppService } from '../../common/services/whatsapp.service';
import { S3Service } from '../../common/services/s3.service';
import { SendMessageDto, PaginationDto } from '../dto';
export declare class MessageService {
    private readonly messageRepository;
    private readonly leadRepository;
    private readonly whatsAppService;
    private readonly s3Service;
    private readonly logger;
    constructor(messageRepository: Repository<Message>, leadRepository: Repository<Lead>, whatsAppService: WhatsAppService, s3Service: S3Service);
    getConversation(leadId: string, pagination: PaginationDto): Promise<{
        data: Message[];
        total: number;
        page: number;
        limit: number;
    }>;
    private isS3Key;
    send(leadId: string, dto: SendMessageDto, senderId: string): Promise<Message>;
    private sendWithRetry;
    private delay;
    storeIncomingMessage(leadId: string, content: string, mediaUrl?: string, mediaType?: string): Promise<Message>;
    findById(id: string): Promise<Message | null>;
    getMessagesByLead(leadId: string): Promise<Message[]>;
}
