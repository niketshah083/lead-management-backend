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
var SlaSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const sla_service_1 = require("./sla.service");
const notification_service_1 = require("../notification/notification.service");
let SlaSchedulerService = SlaSchedulerService_1 = class SlaSchedulerService {
    slaService;
    notificationService;
    logger = new common_1.Logger(SlaSchedulerService_1.name);
    constructor(slaService, notificationService) {
        this.slaService = slaService;
        this.notificationService = notificationService;
    }
    async checkSlaWarnings() {
        this.logger.log('Checking for SLA warnings...');
        try {
            const leadsApproachingBreach = await this.slaService.getLeadsApproachingBreach();
            for (const tracking of leadsApproachingBreach) {
                await this.sendWarningNotification(tracking);
            }
            this.logger.log(`Processed ${leadsApproachingBreach.length} SLA warnings`);
        }
        catch (error) {
            this.logger.error('Error checking SLA warnings', error);
        }
    }
    async checkSlaBreaches() {
        this.logger.log('Checking for SLA breaches...');
        try {
            const breachedLeads = await this.slaService.getBreachedLeads();
            for (const tracking of breachedLeads) {
                await this.sendBreachNotification(tracking);
            }
            this.logger.log(`Processed ${breachedLeads.length} SLA breaches`);
        }
        catch (error) {
            this.logger.error('Error checking SLA breaches', error);
        }
    }
    async sendWarningNotification(tracking) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send SLA warning for lead ${lead.id}`, error);
        }
    }
    async sendBreachNotification(tracking) {
        const lead = tracking.lead;
        if (!lead) {
            return;
        }
        try {
            await this.notificationService.notifySlaBreach(lead, tracking);
            this.logger.log(`Sent SLA breach notification for lead ${lead.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to send SLA breach notification for lead ${lead.id}`, error);
        }
    }
};
exports.SlaSchedulerService = SlaSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaSchedulerService.prototype, "checkSlaWarnings", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlaSchedulerService.prototype, "checkSlaBreaches", null);
exports.SlaSchedulerService = SlaSchedulerService = SlaSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sla_service_1.SlaService,
        notification_service_1.NotificationService])
], SlaSchedulerService);
//# sourceMappingURL=sla-scheduler.service.js.map