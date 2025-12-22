import { NotificationEventType } from '../common/enums';
export declare class NotificationConfig {
    id: string;
    eventType: NotificationEventType;
    emailEnabled: boolean;
    pushEnabled: boolean;
    recipientRoles: string[];
    createdAt: Date;
    updatedAt: Date;
}
