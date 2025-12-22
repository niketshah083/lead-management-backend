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
exports.ReportController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const report_service_1 = require("./report.service");
const dto_1 = require("./dto");
let ReportController = class ReportController {
    reportService;
    constructor(reportService) {
        this.reportService = reportService;
    }
    getDashboardMetrics(filters, req) {
        return this.reportService.getDashboardMetrics(filters, req.user);
    }
    getLeadReport(filters) {
        return this.reportService.getLeadReport(filters);
    }
    getBusinessReport(filters, req) {
        return this.reportService.getBusinessReport(filters, req.user);
    }
    getExecutivePerformance(filters, req) {
        return this.reportService.getExecutivePerformance(filters, req.user);
    }
    getMonthlyTrends(filters, req) {
        return this.reportService.getMonthlyTrends(filters, req.user);
    }
    async exportCsv(filters, res) {
        const buffer = await this.reportService.exportReport(filters, 'csv');
        res.send(buffer);
    }
    async exportPdf(filters, res) {
        const buffer = await this.reportService.exportReport(filters, 'pdf');
        res.send(buffer);
    }
    getPeriodReport(period, filters, req) {
        return this.reportService.getPeriodReport(period, filters, req.user);
    }
    getLeadStatusReport(filters, req) {
        return this.reportService.getLeadStatusReport(filters, req.user);
    }
};
exports.ReportController = ReportController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.CUSTOMER_EXECUTIVE),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DashboardFilterDto, Object]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getLeadReport", null);
__decorate([
    (0, common_1.Get)('business-report'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.CUSTOMER_EXECUTIVE),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getBusinessReport", null);
__decorate([
    (0, common_1.Get)('executive-performance'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getExecutivePerformance", null);
__decorate([
    (0, common_1.Get)('monthly-trends'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.CUSTOMER_EXECUTIVE),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getMonthlyTrends", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename=leads-report.csv'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/pdf'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename=leads-report.pdf'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", Promise)
], ReportController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)('period-report/:period'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.CUSTOMER_EXECUTIVE),
    __param(0, (0, common_1.Param)('period')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getPeriodReport", null);
__decorate([
    (0, common_1.Get)('lead-status-report'),
    (0, roles_decorator_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER, enums_1.UserRole.CUSTOMER_EXECUTIVE),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ReportFilterDto, Object]),
    __metadata("design:returntype", void 0)
], ReportController.prototype, "getLeadStatusReport", null);
exports.ReportController = ReportController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [report_service_1.ReportService])
], ReportController);
//# sourceMappingURL=report.controller.js.map