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
exports.LeadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const lead_service_1 = require("./lead.service");
const decorators_1 = require("../auth/decorators");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
const dto_1 = require("./dto");
let LeadController = class LeadController {
    leadService;
    constructor(leadService) {
        this.leadService = leadService;
    }
    async findAll(filters, user) {
        return this.leadService.findAll(filters, user);
    }
    async findOne(id, user) {
        return this.leadService.findOne(id, user);
    }
    async create(dto) {
        return this.leadService.create(dto);
    }
    async update(id, dto, user) {
        return this.leadService.update(id, dto, user);
    }
    async claim(id, user) {
        return this.leadService.claim(id, user.id);
    }
    async updateStatus(id, dto, user) {
        return this.leadService.updateStatus(id, dto, user);
    }
    async reassign(id, dto, user) {
        return this.leadService.reassign(id, dto, user);
    }
    async getHistory(id, user) {
        return this.leadService.getHistory(id, user);
    }
    async updateAddress(id, dto, user) {
        return this.leadService.updateAddress(id, dto, user);
    }
    async getContacts(id, user) {
        return this.leadService.getContacts(id, user);
    }
    async createContact(id, dto, user) {
        return this.leadService.createContact(id, dto, user);
    }
    async updateContact(id, contactId, dto, user) {
        return this.leadService.updateContact(id, contactId, dto, user);
    }
    async deleteContact(id, contactId, user) {
        return this.leadService.deleteContact(id, contactId, user);
    }
    async lookupPincode(pincode) {
        return this.leadService.lookupPincode(pincode);
    }
    async bulkUpload(file, user) {
        if (!file) {
            throw new common_1.HttpException('No file uploaded', common_1.HttpStatus.BAD_REQUEST);
        }
        if (file.mimetype !== 'text/csv') {
            throw new common_1.HttpException('Invalid file type. Please upload a CSV file.', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.leadService.bulkUploadFromCsv(file, user);
    }
    async getCustomFields(id, user) {
        return this.leadService.getCustomFields(id, user);
    }
    async setCustomField(id, fieldDefinitionId, body, user) {
        return this.leadService.setCustomField(id, fieldDefinitionId, body.value || null, body.arrayValue || null, user);
    }
    async bulkSetCustomFields(id, body, user) {
        return this.leadService.bulkSetCustomFields(id, body.fields, user);
    }
    async deleteCustomField(id, fieldDefinitionId, user) {
        await this.leadService.deleteCustomField(id, fieldDefinitionId, user);
        return { success: true };
    }
    async updateBusinessType(id, body, user) {
        return this.leadService.updateBusinessType(id, body.businessTypeId, user);
    }
    async getLeadWithCustomFields(id, user) {
        return this.leadService.getLeadWithCustomFields(id, user);
    }
};
exports.LeadController = LeadController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LeadFilterDto, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateLeadDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/claim'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "claim", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStatusDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/reassign'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReassignLeadDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "reassign", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Put)(':id/address'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateLeadAddressDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Get)(':id/contacts'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getContacts", null);
__decorate([
    (0, common_1.Post)(':id/contacts'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateLeadContactDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "createContact", null);
__decorate([
    (0, common_1.Put)(':id/contacts/:contactId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('contactId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateLeadContactDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Delete)(':id/contacts/:contactId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('contactId', common_1.ParseUUIDPipe)),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "deleteContact", null);
__decorate([
    (0, common_1.Get)('lookup/pincode/:pincode'),
    __param(0, (0, common_1.Param)('pincode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "lookupPincode", null);
__decorate([
    (0, common_1.Post)('bulk-upload'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN, enums_1.UserRole.MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "bulkUpload", null);
__decorate([
    (0, common_1.Get)(':id/custom-fields'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getCustomFields", null);
__decorate([
    (0, common_1.Put)(':id/custom-fields/:fieldDefinitionId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fieldDefinitionId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "setCustomField", null);
__decorate([
    (0, common_1.Put)(':id/custom-fields'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "bulkSetCustomFields", null);
__decorate([
    (0, common_1.Delete)(':id/custom-fields/:fieldDefinitionId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fieldDefinitionId', common_1.ParseUUIDPipe)),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "deleteCustomField", null);
__decorate([
    (0, common_1.Put)(':id/business-type'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "updateBusinessType", null);
__decorate([
    (0, common_1.Get)(':id/with-custom-fields'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], LeadController.prototype, "getLeadWithCustomFields", null);
exports.LeadController = LeadController = __decorate([
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [lead_service_1.LeadService])
], LeadController);
//# sourceMappingURL=lead.controller.js.map