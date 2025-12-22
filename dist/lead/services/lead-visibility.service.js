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
var LeadVisibilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadVisibilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
const enums_1 = require("../../common/enums");
let LeadVisibilityService = LeadVisibilityService_1 = class LeadVisibilityService {
    userRepository;
    leadRepository;
    logger = new common_1.Logger(LeadVisibilityService_1.name);
    constructor(userRepository, leadRepository) {
        this.userRepository = userRepository;
        this.leadRepository = leadRepository;
    }
    async applyVisibilityFilter(query, currentUser) {
        if (currentUser.role === enums_1.UserRole.ADMIN) {
            this.logger.debug(`Admin ${currentUser.id} has full access`);
            return;
        }
        if (currentUser.role === enums_1.UserRole.MANAGER) {
            const teamMembers = await this.getTeamMembers(currentUser.id);
            const teamIds = [currentUser.id, ...teamMembers.map((m) => m.id)];
            query.andWhere('(lead.assignedToId IN (:...teamIds) OR lead.assignedToId IS NULL)', { teamIds });
            this.logger.debug(`Manager ${currentUser.id} filtered to team: ${teamIds.join(', ')}`);
            return;
        }
        const userWithCategories = await this.userRepository.findOne({
            where: { id: currentUser.id },
            relations: ['categories'],
        });
        const categoryIds = userWithCategories?.categories?.map((c) => c.id) || [];
        if (categoryIds.length > 0) {
            query.andWhere('(lead.assignedToId = :userId OR (lead.assignedToId IS NULL AND lead.categoryId IN (:...categoryIds)))', { userId: currentUser.id, categoryIds });
        }
        else {
            query.andWhere('lead.assignedToId = :userId', {
                userId: currentUser.id,
            });
        }
        this.logger.debug(`CE ${currentUser.id} filtered to assigned leads and categories: ${categoryIds.join(', ')}`);
    }
    async canAccessLead(lead, user) {
        if (user.role === enums_1.UserRole.ADMIN) {
            return true;
        }
        if (user.role === enums_1.UserRole.MANAGER) {
            if (!lead.assignedToId) {
                return true;
            }
            const teamMembers = await this.getTeamMembers(user.id);
            const teamIds = [user.id, ...teamMembers.map((m) => m.id)];
            return teamIds.includes(lead.assignedToId);
        }
        if (lead.assignedToId === user.id) {
            return true;
        }
        if (!lead.assignedToId) {
            const userWithCategories = await this.userRepository.findOne({
                where: { id: user.id },
                relations: ['categories'],
            });
            const categoryIds = userWithCategories?.categories?.map((c) => c.id) || [];
            return lead.categoryId ? categoryIds.includes(lead.categoryId) : false;
        }
        return false;
    }
    async getTeamMembers(managerId) {
        return this.userRepository.find({
            where: { managerId, isActive: true },
            select: ['id', 'name', 'email', 'role'],
        });
    }
    async getEligibleCEsForLead(lead) {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.categories', 'category')
            .where('category.id = :categoryId', { categoryId: lead.categoryId })
            .andWhere('user.role = :role', { role: enums_1.UserRole.CUSTOMER_EXECUTIVE })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getMany();
        return users;
    }
    async getVisibleLeads(user) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
            .where('lead.deletedAt IS NULL');
        await this.applyVisibilityFilter(query, user);
        return query.orderBy('lead.createdAt', 'DESC').getMany();
    }
};
exports.LeadVisibilityService = LeadVisibilityService;
exports.LeadVisibilityService = LeadVisibilityService = LeadVisibilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeadVisibilityService);
//# sourceMappingURL=lead-visibility.service.js.map