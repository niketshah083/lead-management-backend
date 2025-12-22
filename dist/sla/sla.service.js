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
var SlaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
let SlaService = SlaService_1 = class SlaService {
    policyRepository;
    trackingRepository;
    leadRepository;
    logger = new common_1.Logger(SlaService_1.name);
    constructor(policyRepository, trackingRepository, leadRepository) {
        this.policyRepository = policyRepository;
        this.trackingRepository = trackingRepository;
        this.leadRepository = leadRepository;
    }
    async createPolicy(dto) {
        if (dto.isDefault) {
            await this.policyRepository.update({ isDefault: true }, { isDefault: false });
        }
        const policy = this.policyRepository.create({
            name: dto.name,
            firstResponseMinutes: dto.firstResponseMinutes,
            followUpMinutes: dto.followUpMinutes ?? dto.firstResponseMinutes * 2,
            resolutionMinutes: dto.resolutionMinutes,
            warningThresholdPercent: dto.warningThresholdPercent ?? 80,
            isDefault: dto.isDefault ?? false,
            isActive: true,
        });
        const savedPolicy = await this.policyRepository.save(policy);
        this.logger.log(`Created SLA policy ${savedPolicy.id}: ${savedPolicy.name}`);
        return savedPolicy;
    }
    async updatePolicy(id, dto) {
        const policy = await this.findPolicyById(id);
        if (dto.isDefault) {
            await this.policyRepository.update({ isDefault: true, id: { $ne: id } }, { isDefault: false });
        }
        Object.assign(policy, dto);
        const savedPolicy = await this.policyRepository.save(policy);
        this.logger.log(`Updated SLA policy ${id}`);
        return savedPolicy;
    }
    async findPolicyById(id) {
        const policy = await this.policyRepository.findOne({ where: { id } });
        if (!policy) {
            throw new common_1.NotFoundException(`SLA policy with ID ${id} not found`);
        }
        return policy;
    }
    async findAllPolicies() {
        return this.policyRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }
    async getDefaultPolicy() {
        return this.policyRepository.findOne({
            where: { isDefault: true, isActive: true },
        });
    }
    async initializeSlaTracking(leadId, policyId) {
        const lead = await this.leadRepository.findOne({ where: { id: leadId } });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${leadId} not found`);
        }
        let policy = null;
        if (policyId) {
            policy = await this.findPolicyById(policyId);
        }
        else {
            policy = await this.getDefaultPolicy();
        }
        if (!policy) {
            throw new common_1.BadRequestException('No SLA policy available');
        }
        const now = new Date();
        const firstResponseDue = new Date(now.getTime() + policy.firstResponseMinutes * 60 * 1000);
        const resolutionDue = new Date(now.getTime() + policy.resolutionMinutes * 60 * 1000);
        const tracking = this.trackingRepository.create({
            leadId,
            policyId: policy.id,
            firstResponseDue,
            resolutionDue,
            firstResponseBreached: false,
            resolutionBreached: false,
        });
        const savedTracking = await this.trackingRepository.save(tracking);
        this.logger.log(`Initialized SLA tracking for lead ${leadId}`);
        return savedTracking;
    }
    async recordFirstResponse(leadId) {
        const tracking = await this.findTrackingByLeadId(leadId);
        if (tracking.firstResponseAt) {
            return tracking;
        }
        const now = new Date();
        tracking.firstResponseAt = now;
        tracking.firstResponseBreached = now > tracking.firstResponseDue;
        const savedTracking = await this.trackingRepository.save(tracking);
        this.logger.log(`Recorded first response for lead ${leadId}, breached: ${tracking.firstResponseBreached}`);
        return savedTracking;
    }
    async recordResolution(leadId) {
        const tracking = await this.findTrackingByLeadId(leadId);
        const now = new Date();
        tracking.resolvedAt = now;
        tracking.resolutionBreached = now > tracking.resolutionDue;
        const savedTracking = await this.trackingRepository.save(tracking);
        this.logger.log(`Recorded resolution for lead ${leadId}, breached: ${tracking.resolutionBreached}`);
        return savedTracking;
    }
    async findTrackingByLeadId(leadId) {
        const tracking = await this.trackingRepository.findOne({
            where: { leadId },
            relations: ['policy'],
        });
        if (!tracking) {
            throw new common_1.NotFoundException(`SLA tracking for lead ${leadId} not found`);
        }
        return tracking;
    }
    async getSlaStatus(leadId) {
        const tracking = await this.findTrackingByLeadId(leadId);
        const policy = tracking.policy || (await this.findPolicyById(tracking.policyId));
        const now = new Date();
        let currentStatus = 'on_track';
        let timeRemaining = 0;
        if (!tracking.firstResponseAt) {
            timeRemaining = tracking.firstResponseDue.getTime() - now.getTime();
            if (now > tracking.firstResponseDue) {
                currentStatus = 'breached';
            }
            else {
                const totalTime = tracking.firstResponseDue.getTime() - tracking.createdAt.getTime();
                const elapsed = now.getTime() - tracking.createdAt.getTime();
                const percentElapsed = (elapsed / totalTime) * 100;
                if (percentElapsed >= policy.warningThresholdPercent) {
                    currentStatus = 'warning';
                }
            }
        }
        else if (!tracking.resolvedAt) {
            timeRemaining = tracking.resolutionDue.getTime() - now.getTime();
            if (now > tracking.resolutionDue) {
                currentStatus = 'breached';
            }
            else {
                const totalTime = tracking.resolutionDue.getTime() - tracking.createdAt.getTime();
                const elapsed = now.getTime() - tracking.createdAt.getTime();
                const percentElapsed = (elapsed / totalTime) * 100;
                if (percentElapsed >= policy.warningThresholdPercent) {
                    currentStatus = 'warning';
                }
            }
        }
        return { tracking, currentStatus, timeRemaining };
    }
    async getLeadsApproachingBreach() {
        const now = new Date();
        const trackings = await this.trackingRepository
            .createQueryBuilder('tracking')
            .leftJoinAndSelect('tracking.policy', 'policy')
            .leftJoinAndSelect('tracking.lead', 'lead')
            .where('tracking.resolvedAt IS NULL')
            .andWhere('lead.status NOT IN (:...closedStatuses)', {
            closedStatuses: [enums_1.LeadStatus.WON, enums_1.LeadStatus.LOST],
        })
            .getMany();
        return trackings.filter((tracking) => {
            const policy = tracking.policy;
            const warningThreshold = policy.warningThresholdPercent / 100;
            if (!tracking.firstResponseAt) {
                const totalTime = tracking.firstResponseDue.getTime() - tracking.createdAt.getTime();
                const elapsed = now.getTime() - tracking.createdAt.getTime();
                return elapsed / totalTime >= warningThreshold;
            }
            const totalTime = tracking.resolutionDue.getTime() - tracking.createdAt.getTime();
            const elapsed = now.getTime() - tracking.createdAt.getTime();
            return elapsed / totalTime >= warningThreshold;
        });
    }
    async getBreachedLeads() {
        const now = new Date();
        return this.trackingRepository
            .createQueryBuilder('tracking')
            .leftJoinAndSelect('tracking.policy', 'policy')
            .leftJoinAndSelect('tracking.lead', 'lead')
            .where('tracking.resolvedAt IS NULL')
            .andWhere('((tracking.firstResponseAt IS NULL AND tracking.firstResponseDue < :now) OR ' +
            '(tracking.firstResponseAt IS NOT NULL AND tracking.resolutionDue < :now))', { now })
            .getMany();
    }
};
exports.SlaService = SlaService;
exports.SlaService = SlaService = SlaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.SlaPolicy)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.SlaTracking)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SlaService);
//# sourceMappingURL=sla.service.js.map