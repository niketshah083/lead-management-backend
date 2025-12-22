"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
let NotificationService = NotificationService_1 = class NotificationService {
    userRepository;
    configRepository;
    logRepository;
    configService;
    logger = new common_1.Logger(NotificationService_1.name);
    nodemailer = null;
    firebaseAdmin = null;
    constructor(userRepository, configRepository, logRepository, configService) {
        this.userRepository = userRepository;
        this.configRepository = configRepository;
        this.logRepository = logRepository;
        this.configService = configService;
        this.initializeServices();
    }
    async initializeServices() {
        try {
            this.nodemailer = require('nodemailer');
            this.logger.log('Nodemailer initialized');
        }
        catch (error) {
            this.logger.warn('Nodemailer not available');
        }
        try {
            this.firebaseAdmin = require('firebase-admin');
            this.logger.log('Firebase Admin initialized');
        }
        catch (error) {
            this.logger.warn('Firebase Admin not available');
        }
    }
    async sendEmail(dto) {
        if (!this.nodemailer) {
            this.logger.warn('Email service not configured');
            return false;
        }
        try {
            const transporter = this.nodemailer.createTransport({
                host: this.configService.get('SMTP_HOST'),
                port: this.configService.get('SMTP_PORT'),
                secure: this.configService.get('SMTP_SECURE'),
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASS'),
                },
            });
            const htmlContent = this.renderTemplate(dto.template, dto.context || {});
            await transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                to: dto.to.join(', '),
                subject: dto.subject,
                html: htmlContent,
            });
            this.logger.log(`Email sent to ${dto.to.join(', ')}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`);
            return false;
        }
    }
    async sendPushNotification(dto) {
        if (!this.firebaseAdmin) {
            this.logger.warn('Push notification service not configured');
            return false;
        }
        try {
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
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`);
            return false;
        }
    }
    async notifyNewLead(lead, eligibleUsers) {
        const config = await this.getNotificationConfig(enums_1.NotificationEventType.NEW_LEAD);
        if (!config)
            return;
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
            await this.logNotification(config.id, eligibleUsers.map((u) => u.id), enums_1.NotificationChannel.EMAIL, `New Lead: ${lead.phoneNumber}`);
        }
        if (config.pushEnabled) {
            await this.sendPushNotification({
                userIds: eligibleUsers.map((u) => u.id),
                title: 'New Lead',
                body: `New lead from ${lead.phoneNumber}`,
                data: { leadId: lead.id },
            });
            await this.logNotification(config.id, eligibleUsers.map((u) => u.id), enums_1.NotificationChannel.PUSH, 'New Lead');
        }
    }
    async notifySlaWarning(lead, slaStatus) {
        const config = await this.getNotificationConfig(enums_1.NotificationEventType.SLA_WARNING);
        if (!config)
            return;
        const recipients = [];
        if (lead.assignedTo) {
            recipients.push(lead.assignedTo);
        }
        if (lead.assignedTo?.managerId) {
            const manager = await this.userRepository.findOne({
                where: { id: lead.assignedTo.managerId },
            });
            if (manager)
                recipients.push(manager);
        }
        if (recipients.length === 0)
            return;
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
    async notifySlaBreach(lead, slaStatus) {
        const config = await this.getNotificationConfig(enums_1.NotificationEventType.SLA_BREACH);
        if (!config)
            return;
        const recipients = await this.userRepository.find({
            where: [{ role: 'manager' }, { role: 'admin' }],
        });
        if (recipients.length === 0)
            return;
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
    async notifyNewMessage(lead, message) {
        const config = await this.getNotificationConfig(enums_1.NotificationEventType.NEW_MESSAGE);
        if (!config)
            return;
        if (!lead.assignedTo)
            return;
        if (config.pushEnabled) {
            await this.sendPushNotification({
                userIds: [lead.assignedToId],
                title: 'New Message',
                body: `New message from ${lead.phoneNumber}`,
                data: { leadId: lead.id, messageId: message.id },
            });
        }
    }
    async getNotificationConfig(eventType) {
        return this.configRepository.findOne({
            where: { eventType },
        });
    }
    async logNotification(configId, userIds, channel, subject) {
        for (const userId of userIds) {
            const log = this.logRepository.create({
                configId,
                userId,
                channel,
                subject,
                content: '',
                status: enums_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
            await this.logRepository.save(log);
        }
    }
    renderTemplate(template, context) {
        let html = this.getTemplateContent(template);
        for (const [key, value] of Object.entries(context)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
        return html;
    }
    getTemplateContent(template) {
        const templates = {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.NotificationConfig)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.NotificationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map