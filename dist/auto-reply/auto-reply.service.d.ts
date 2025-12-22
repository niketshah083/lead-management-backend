import { Repository } from 'typeorm';
import { AutoReplyTemplate, Category, Lead, Message, CategoryMedia } from '../entities';
import { WhatsAppService } from '../common/services/whatsapp.service';
import { S3Service } from '../common/services/s3.service';
import { CreateAutoReplyTemplateDto, UpdateAutoReplyTemplateDto } from './dto';
export declare class AutoReplyService {
    private readonly templateRepository;
    private readonly categoryRepository;
    private readonly messageRepository;
    private readonly leadRepository;
    private readonly categoryMediaRepository;
    private readonly whatsAppService;
    private readonly s3Service;
    private readonly logger;
    constructor(templateRepository: Repository<AutoReplyTemplate>, categoryRepository: Repository<Category>, messageRepository: Repository<Message>, leadRepository: Repository<Lead>, categoryMediaRepository: Repository<CategoryMedia>, whatsAppService: WhatsAppService, s3Service: S3Service);
    create(dto: CreateAutoReplyTemplateDto): Promise<AutoReplyTemplate>;
    findAll(categoryId?: string): Promise<AutoReplyTemplate[]>;
    findOne(id: string): Promise<AutoReplyTemplate>;
    update(id: string, dto: UpdateAutoReplyTemplateDto): Promise<AutoReplyTemplate>;
    remove(id: string): Promise<void>;
    selectTemplate(categoryId: string, messageContent: string): Promise<AutoReplyTemplate | null>;
    sendAutoReply(leadId: string, messageContent: string): Promise<Message | null>;
    sendCategoryMedia(leadId: string): Promise<void>;
    private sendIndividualMedia;
}
