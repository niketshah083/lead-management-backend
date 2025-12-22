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
var LeadStatusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let LeadStatusService = LeadStatusService_1 = class LeadStatusService {
    statusRepository;
    transitionRepository;
    logger = new common_1.Logger(LeadStatusService_1.name);
    constructor(statusRepository, transitionRepository) {
        this.statusRepository = statusRepository;
        this.transitionRepository = transitionRepository;
    }
    async findAll() {
        return this.statusRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            order: { order: 'ASC' },
        });
    }
    async findOne(id) {
        const status = await this.statusRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!status) {
            throw new common_1.NotFoundException(`Lead status with ID ${id} not found`);
        }
        return status;
    }
    async findInitialStatus() {
        return this.statusRepository.findOne({
            where: { isInitial: true, isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
        });
    }
    async create(dto) {
        if (dto.isInitial) {
            await this.statusRepository.update({ isInitial: true }, { isInitial: false });
        }
        const status = this.statusRepository.create(dto);
        const saved = await this.statusRepository.save(status);
        this.logger.log(`Created lead status: ${saved.name}`);
        return saved;
    }
    async update(id, dto) {
        const status = await this.findOne(id);
        if (dto.isInitial && !status.isInitial) {
            await this.statusRepository.update({ isInitial: true }, { isInitial: false });
        }
        Object.assign(status, dto);
        const updated = await this.statusRepository.save(status);
        this.logger.log(`Updated lead status: ${updated.name}`);
        return updated;
    }
    async delete(id) {
        const status = await this.findOne(id);
        await this.statusRepository.softRemove(status);
        this.logger.log(`Deleted lead status: ${status.name}`);
    }
    async reorder(statuses) {
        for (const item of statuses) {
            await this.statusRepository.update(item.id, { order: item.order });
        }
        this.logger.log('Reordered lead statuses');
    }
    async findAllTransitions() {
        return this.transitionRepository.find({
            relations: ['fromStatus', 'toStatus'],
            order: { fromStatus: { order: 'ASC' }, toStatus: { order: 'ASC' } },
        });
    }
    async findTransitionsFrom(fromStatusId) {
        return this.transitionRepository.find({
            where: { fromStatusId, isActive: true },
            relations: ['toStatus'],
            order: { toStatus: { order: 'ASC' } },
        });
    }
    async findAllowedNextStatuses(fromStatusId, userRole) {
        const transitions = await this.transitionRepository.find({
            where: { fromStatusId, isActive: true },
            relations: ['toStatus'],
        });
        return transitions
            .filter((t) => {
            if (!t.allowedRoles || t.allowedRoles.length === 0)
                return true;
            if (userRole)
                return t.allowedRoles.includes(userRole);
            return true;
        })
            .map((t) => t.toStatus)
            .filter((s) => s.isActive)
            .sort((a, b) => a.order - b.order);
    }
    async createTransition(dto) {
        await this.findOne(dto.fromStatusId);
        await this.findOne(dto.toStatusId);
        const existing = await this.transitionRepository.findOne({
            where: { fromStatusId: dto.fromStatusId, toStatusId: dto.toStatusId },
        });
        if (existing) {
            Object.assign(existing, dto);
            existing.isActive = true;
            return this.transitionRepository.save(existing);
        }
        const transition = this.transitionRepository.create(dto);
        const saved = await this.transitionRepository.save(transition);
        this.logger.log(`Created status transition: ${dto.fromStatusId} -> ${dto.toStatusId}`);
        return saved;
    }
    async bulkCreateTransitions(dto) {
        const results = [];
        for (const toStatusId of dto.toStatusIds) {
            const transition = await this.createTransition({
                fromStatusId: dto.fromStatusId,
                toStatusId,
                requiresComment: dto.requiresComment,
            });
            results.push(transition);
        }
        return results;
    }
    async updateTransition(id, dto) {
        const transition = await this.transitionRepository.findOne({
            where: { id },
        });
        if (!transition) {
            throw new common_1.NotFoundException(`Status transition with ID ${id} not found`);
        }
        Object.assign(transition, dto);
        const updated = await this.transitionRepository.save(transition);
        this.logger.log(`Updated status transition: ${id}`);
        return updated;
    }
    async deleteTransition(id) {
        const transition = await this.transitionRepository.findOne({
            where: { id },
        });
        if (!transition) {
            throw new common_1.NotFoundException(`Status transition with ID ${id} not found`);
        }
        await this.transitionRepository.remove(transition);
        this.logger.log(`Deleted status transition: ${id}`);
    }
    async isTransitionAllowed(fromStatusId, toStatusId, userRole) {
        const transition = await this.transitionRepository.findOne({
            where: { fromStatusId, toStatusId, isActive: true },
        });
        if (!transition) {
            return { allowed: false, requiresComment: false };
        }
        if (transition.allowedRoles &&
            transition.allowedRoles.length > 0 &&
            userRole) {
            if (!transition.allowedRoles.includes(userRole)) {
                return { allowed: false, requiresComment: false };
            }
        }
        return { allowed: true, requiresComment: transition.requiresComment };
    }
};
exports.LeadStatusService = LeadStatusService;
exports.LeadStatusService = LeadStatusService = LeadStatusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.LeadStatusMaster)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.StatusTransition)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeadStatusService);
//# sourceMappingURL=lead-status.service.js.map