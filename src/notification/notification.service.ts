import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  User,
  Lead,
  Message,
  NotificationConfig,
  NotificationLog,
  SlaTracking,
} from '../entities';
import {
  NotificationEventType,
  NotificationChannel,
  NotificationStatus,
} from '../common/enums';
import { EmailNotificationDto, PushNotificationDto } from './dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private nodemailer: any = null;
  private firebaseAdmin: any = null;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NotificationConfig)
    private readonly configRepository: Repository<NotificationConfig>,
    @InjectRepository(NotificationLog)
    private readonly logRepository: Repository<NotificationLog>,
    private readonly configService: ConfigService,
  ) {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    try {
      this.nodemailer = require('nodemailer');
      this.logger.log('Nodemailer initialized');
    } catch (error) {
      this.logger.warn('Nodemailer not available');
    }

    try {
      this.firebaseAdmin = require('firebase-admin');
      this.logger.log('Firebase Admin initialized');
    } catch (error) {
      this.logger.warn('Firebase Admin not available');
    }
  }

  async sendEmail(dto: EmailNotificationDto): Promise<boolean> {
    if (!this.nodemailer) {
      this.logger.warn('Email service not configured');
      return false;
    }

    try {
      const transporter = this.nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<boolean>('SMTP_SECURE'),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });

      const htmlContent = this.renderTemplate(dto.template, dto.context || {});

      await transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM'),
        to: dto.to.join(', '),
        subject: dto.subject,
        html: htmlContent,
      });

      this.logger.log(`Email sent to ${dto.to.join(', ')}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendPushNotification(dto: PushNotificationDto): Promise<boolean> {
    if (!this.firebaseAdmin) {
      this.logger.warn('Push notification service not configured');
      return false;
    }

    try {
      // Get FCM tokens for users
      const users = await this.userRepository.find({
        where: dto.userIds.map((id) => ({ id })),
        select: ['id', 'fcmToken'],
      });

      const tokens = users.filter((u) => u.fcmToken).map((u) => u.fcmToken);

      if (tokens.length === 0) {
        this.logger.warn('No FCM tokens found for users');
        return false;
      }

      const message = {
        notification: {
          title: dto.title,
          body: dto.body,
        },
        data: dto.data || {},
        tokens,
      };

      await this.firebaseAdmin.messaging().sendMulticast(message);
      this.logger.log(`Push notification sent to ${tokens.length} devices`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  async notifyNewLead(lead: Lead, eligibleUsers: User[]): Promise<void> {
    const config = await this.getNotificationConfig(
      NotificationEventType.NEW_LEAD,
    );
    if (!config) return;

    const emailRecipients = eligibleUsers
      .filter((u) => u.email)
      .map((u) => u.email);

    if (config.emailEnabled && emailRecipients.length > 0) {
      await this.sendEmail({
        to: emailRecipients,
        subject: `New Lead: ${lead.phoneNumber}`,
        template: 'new-lead',
        context: {
          leadId: lead.id,
          phoneNumber: lead.phoneNumber,
          categoryName: lead.category?.name || 'Unknown',
        },
      });

      await this.logNotification(
        config.id,
        eligibleUsers.map((u) => u.id),
        NotificationChannel.EMAIL,
        `New Lead: ${lead.phoneNumber}`,
      );
    }

    if (config.pushEnabled) {
      await this.sendPushNotification({
        userIds: eligibleUsers.map((u) => u.id),
        title: 'New Lead',
        body: `New lead from ${lead.phoneNumber}`,
        data: { leadId: lead.id },
      });

      await this.logNotification(
        config.id,
        eligibleUsers.map((u) => u.id),
        NotificationChannel.PUSH,
        'New Lead',
      );
    }
  }

  async notifySlaWarning(lead: Lead, slaStatus: SlaTracking): Promise<void> {
    const config = await this.getNotificationConfig(
      NotificationEventType.SLA_WARNING,
    );
    if (!config) return;

    const recipients: User[] = [];

    // Add assigned user
    if (lead.assignedTo) {
      recipients.push(lead.assignedTo);
    }

    // Add manager
    if (lead.assignedTo?.managerId) {
      const manager = await this.userRepository.findOne({
        where: { id: lead.assignedTo.managerId },
      });
      if (manager) recipients.push(manager);
    }

    if (recipients.length === 0) return;

    if (config.emailEnabled) {
      await this.sendEmail({
        to: recipients.map((u) => u.email),
        subject: `SLA Warning: Lead ${lead.phoneNumber}`,
        template: 'sla-warning',
        context: {
          leadId: lead.id,
          phoneNumber: lead.phoneNumber,
          dueTime: slaStatus.firstResponseDue,
        },
      });
    }

    if (config.pushEnabled) {
      await this.sendPushNotification({
        userIds: recipients.map((u) => u.id),
        title: 'SLA Warning',
        body: `Lead ${lead.phoneNumber} approaching SLA breach`,
        data: { leadId: lead.id },
      });
    }
  }

  async notifySlaBreach(lead: Lead, slaStatus: SlaTracking): Promise<void> {
    const config = await this.getNotificationConfig(
      NotificationEventType.SLA_BREACH,
    );
    if (!config) return;

    // Get managers and admins
    const recipients = await this.userRepository.find({
      where: [{ role: 'manager' as any }, { role: 'admin' as any }],
    });

    if (recipients.length === 0) return;

    if (config.emailEnabled) {
      await this.sendEmail({
        to: recipients.map((u) => u.email),
        subject: `SLA Breach: Lead ${lead.phoneNumber}`,
        template: 'sla-breach',
        context: {
          leadId: lead.id,
          phoneNumber: lead.phoneNumber,
          breachType: slaStatus.firstResponseAt
            ? 'resolution'
            : 'first_response',
        },
      });
    }

    if (config.pushEnabled) {
      await this.sendPushNotification({
        userIds: recipients.map((u) => u.id),
        title: 'SLA Breach',
        body: `Lead ${lead.phoneNumber} has breached SLA`,
        data: { leadId: lead.id },
      });
    }
  }

  async notifyNewMessage(lead: Lead, message: Message): Promise<void> {
    const config = await this.getNotificationConfig(
      NotificationEventType.NEW_MESSAGE,
    );
    if (!config) return;

    if (!lead.assignedTo) return;

    if (config.pushEnabled) {
      await this.sendPushNotification({
        userIds: [lead.assignedToId!],
        title: 'New Message',
        body: `New message from ${lead.phoneNumber}`,
        data: { leadId: lead.id, messageId: message.id },
      });
    }
  }

  private async getNotificationConfig(
    eventType: NotificationEventType,
  ): Promise<NotificationConfig | null> {
    return this.configRepository.findOne({
      where: { eventType },
    });
  }

  private async logNotification(
    configId: string,
    userIds: string[],
    channel: NotificationChannel,
    subject: string,
  ): Promise<void> {
    for (const userId of userIds) {
      const log = this.logRepository.create({
        configId,
        userId,
        channel,
        subject,
        content: '',
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
      await this.logRepository.save(log);
    }
  }

  private renderTemplate(
    template: string,
    context: Record<string, any>,
  ): string {
    // Simple template rendering
    let html = this.getTemplateContent(template);
    for (const [key, value] of Object.entries(context)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return html;
  }

  private getTemplateContent(template: string): string {
    const templates: Record<string, string> = {
      'new-lead': `
        <h1>New Lead Received</h1>
        <p>A new lead has been received:</p>
        <ul>
          <li>Phone: {{phoneNumber}}</li>
          <li>Category: {{categoryName}}</li>
        </ul>
      `,
      'sla-warning': `
        <h1>SLA Warning</h1>
        <p>Lead {{phoneNumber}} is approaching SLA breach.</p>
        <p>Due time: {{dueTime}}</p>
      `,
      'sla-breach': `
        <h1>SLA Breach Alert</h1>
        <p>Lead {{phoneNumber}} has breached SLA.</p>
        <p>Breach type: {{breachType}}</p>
      `,
    };
    return templates[template] || '<p>{{body}}</p>';
  }
}
