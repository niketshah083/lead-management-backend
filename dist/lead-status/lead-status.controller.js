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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadStatusController = void 0;
const common_1 = require("@nestjs/common");
const lead_status_service_1 = require("./lead-status.service");
const decorators_1 = require("../auth/decorators");
const enums_1 = require("../common/enums");
const entities_1 = require("../entities");
const dto_1 = require("./dto");
let LeadStatusController = class LeadStatusController {
    statusService;
    constructor(statusService) {
        this.statusService = statusService;
    }
    async findAll() {
        const data = await this.statusService.findAll();
        return { data };
    }
    async findInitial() {
        const data = await this.statusService.findInitialStatus();
        return { data };
    }
    async findOne(id) {
        const data = await this.statusService.findOne(id);
        return { data };
    }
    async getAllowedNextStatuses(id, user) {
        const data = await this.statusService.findAllowedNextStatuses(id, user.role);
        return { data };
    }
    async create(dto) {
        const data = await this.statusService.create(dto);
        return { data };
    }
    async update(id, dto) {
        const data = await this.statusService.update(id, dto);
        return { data };
    }
    async delete(id) {
        await this.statusService.delete(id);
        return { message: 'Lead status deleted successfully' };
    }
    async reorder(statuses) {
        await this.statusService.reorder(statuses);
        return { message: 'Lead statuses reordered successfully' };
    }
    async findAllTransitions() {
        const data = await this.statusService.findAllTransitions();
        return { data };
    }
    async findTransitionsFrom(id) {
        const data = await this.statusService.findTransitionsFrom(id);
        return { data };
    }
    async createTransition(dto) {
        const data = await this.statusService.createTransition(dto);
        return { data };
    }
    async bulkCreateTransitions(dto) {
        const data = await this.statusService.bulkCreateTransitions(dto);
        return { data };
    }
    async updateTransition(id, dto) {
        const data = await this.statusService.updateTransition(id, dto);
        return { data };
    }
    async deleteTransition(id) {
        await this.statusService.deleteTransition(id);
        return { message: 'Status transition deleted successfully' };
    }
    async checkTransition(fromStatusId, toStatusId, user) {
        const data = await this.statusService.isTransitionAllowed(fromStatusId, toStatusId, user.role);
        return { data };
    }
};
exports.LeadStatusController = LeadStatusController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('initial'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "findInitial", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/allowed-next'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "getAllowedNextStatuses", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateLeadStatusDto]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateLeadStatusDto]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)('reorder/all'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)('transitions/all'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "findAllTransitions", null);
__decorate([
    (0, common_1.Get)(':id/transitions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "findTransitionsFrom", null);
__decorate([
    (0, common_1.Post)('transitions'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateStatusTransitionDto]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "createTransition", null);
__decorate([
    (0, common_1.Post)('transitions/bulk'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BulkCreateTransitionsDto]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "bulkCreateTransitions", null);
__decorate([
    (0, common_1.Put)('transitions/:id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStatusTransitionDto]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "updateTransition", null);
__decorate([
    (0, common_1.Delete)('transitions/:id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "deleteTransition", null);
__decorate([
    (0, common_1.Get)('transitions/check'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadStatusController.prototype, "checkTransition", null);
exports.LeadStatusController = LeadStatusController = __decorate([
    (0, common_1.Controller)('lead-statuses'),
    __metadata("design:paramtypes", [lead_status_service_1.LeadStatusService])
], LeadStatusController);
//# sourceMappingURL=lead-status.controller.js.map