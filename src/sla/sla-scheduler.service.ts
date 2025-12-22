import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SlaService } from './sla.service';
import { NotificationService } from '../notification/notification.service';
import { SlaTracking } from '../entities';

@Injectable()
export class SlaSchedulerService {
  private readonly logger = new Logger(SlaSchedulerService.name);

  constructor(
    private readonly slaService: SlaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Check for SLA warnings every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkSlaWarnings(): Promise<void> {
    this.logger.log('Checking for SLA warnings...');

    try {
      const leadsApproachingBreach =
        await this.slaService.getLeadsApproachingBreach();

      for (const tracking of leadsApproachingBreach) {
        await this.sendWarningNotification(tracking);
      }

      this.logger.log(
        `Processed ${leadsApproachingBreach.length} SLA warnings`,
      );
    } catch (error) {
      this.logger.error('Error checking SLA warnings', error);
    }
  }

  /**
   * Check for SLA breaches every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches(): Promise<void> {
    this.logger.log('Checking for SLA breaches...');

    try {
      const breachedLeads = await this.slaService.getBreachedLeads();

      for (const tracking of breachedLeads) {
        await this.sendBreachNotification(tracking);
      }

      this.logger.log(`Processed ${breachedLeads.length} SLA breaches`);
    } catch (error) {
      this.logger.error('Error checking SLA breaches', error);
    }
  }

  private async sendWarningNotification(tracking: SlaTracking): Promise<void> {
    const lead = tracking.lead;
    if (!lead) {
      return;
    }

    const assignedUserId = lead.assignedToId;
    if (!assignedUserId) {
      return;
    }

    try {
      await this.notificationService.notifySlaWarning(lead, tracking);
      this.logger.log(`Sent SLA warning notification for lead ${lead.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send SLA warning for lead ${lead.id}`,
        error,
      );
    }
  }

  private async sendBreachNotification(tracking: SlaTracking): Promise<void> {
    const lead = tracking.lead;
    if (!lead) {
      return;
    }

    try {
      await this.notificationService.notifySlaBreach(lead, tracking);
      this.logger.log(`Sent SLA breach notification for lead ${lead.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send SLA breach notification for lead ${lead.id}`,
        error,
      );
    }
  }
}
