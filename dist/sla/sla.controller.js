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
exports.SlaController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const sla_service_1 = require("./sla.service");
const dto_1 = require("./dto");
let SlaController = class SlaController {
    slaService;
    constructor(slaService) {
        this.slaService = slaService;
    }
    createPolicy(dto) {
        return this.slaService.createPolicy(dto);
    }
    findAllPolicies() {
        return this.slaService.findAllPolicies();
    }
    findPolicy(id) {
        return this.slaService.findPolicyById(id);
    }
    updatePolicy(id, dto) {
        return this.slaService.updatePolicy(id, dto);
    }
    getSlaStatus(leadId) {
        return this.slaService.getSlaStatus(leadId);
    }
    getLeadsApproachingBreach() {
        return this.slaService.getLeadsApproachingBreach();
    }
    getBreachedLeads() {
        return this.slaService.getBreachedLeads();
    }
};
exports.SlaController = SlaController;
__decorate([
    (0, common_1.Post)('policies'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSlaPolicyDto]),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Get)('policies'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "findAllPolicies", null);
__decorate([
    (0, common_1.Get)('policies/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "findPolicy", null);
__decorate([
    (0, common_1.Put)('policies/:id'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSlaPolicyDto]),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "updatePolicy", null);
__decorate([
    (0, common_1.Get)('leads/:leadId/status'),
    __param(0, (0, common_1.Param)('leadId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "getSlaStatus", null);
__decorate([
    (0, common_1.Get)('warnings'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "getLeadsApproachingBreach", null);
__decorate([
    (0, common_1.Get)('breaches'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlaController.prototype, "getBreachedLeads", null);
exports.SlaController = SlaController = __decorate([
    (0, common_1.Controller)('sla'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sla_service_1.SlaService])
], SlaController);
//# sourceMappingURL=sla.controller.js.map