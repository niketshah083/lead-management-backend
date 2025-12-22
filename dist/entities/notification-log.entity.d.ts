import { NotificationChannel, NotificationStatus } from '../common/enums';
import { NotificationConfig } from './notification-config.entity';
import { User } from './user.entity';
export declare class NotificationLog {
    id: string;
    configId: string;
    config: NotificationConfig;
    userId: string;
    user: User;
    channel: NotificationChannel;
    subject: string;
    content: string;
    status: NotificationStatus;
    sentAt: Date;
}
