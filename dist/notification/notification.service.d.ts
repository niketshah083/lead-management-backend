import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, Lead, Message, NotificationConfig, NotificationLog, SlaTracking } from '../entities';
import { EmailNotificationDto, PushNotificationDto } from './dto';
export declare class NotificationService {
    private readonly userRepository;
    private readonly configRepository;
    private readonly logRepository;
    private readonly configService;
    private readonly logger;
    private nodemailer;
    private firebaseAdmin;
    constructor(userRepository: Repository<User>, configRepository: Repository<NotificationConfig>, logRepository: Repository<NotificationLog>, configService: ConfigService);
    private initializeServices;
    sendEmail(dto: EmailNotificationDto): Promise<boolean>;
    sendPushNotification(dto: PushNotificationDto): Promise<boolean>;
    notifyNewLead(lead: Lead, eligibleUsers: User[]): Promise<void>;
    notifySlaWarning(lead: Lead, slaStatus: SlaTracking): Promise<void>;
    notifySlaBreach(lead: Lead, slaStatus: SlaTracking): Promise<void>;
    notifyNewMessage(lead: Lead, message: Message): Promise<void>;
    private getNotificationConfig;
    private logNotification;
    private renderTemplate;
    private getTemplateContent;
}
