import { SlaService } from './sla.service';
import { NotificationService } from '../notification/notification.service';
export declare class SlaSchedulerService {
    private readonly slaService;
    private readonly notificationService;
    private readonly logger;
    constructor(slaService: SlaService, notificationService: NotificationService);
    checkSlaWarnings(): Promise<void>;
    checkSlaBreaches(): Promise<void>;
    private sendWarningNotification;
    private sendBreachNotification;
}
