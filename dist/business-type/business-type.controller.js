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
exports.BusinessTypeController = void 0;
const common_1 = require("@nestjs/common");
const business_type_service_1 = require("./business-type.service");
const dto_1 = require("./dto");
let BusinessTypeController = class BusinessTypeController {
    businessTypeService;
    constructor(businessTypeService) {
        this.businessTypeService = businessTypeService;
    }
    async findAll(activeOnly) {
        if (activeOnly === 'true') {
            return this.businessTypeService.findActiveBusinessTypes();
        }
        return this.businessTypeService.findAllBusinessTypes();
    }
    async findOne(id) {
        return this.businessTypeService.findOneBusinessType(id);
    }
    async create(dto) {
        return this.businessTypeService.createBusinessType(dto);
    }
    async reorder(items) {
        await this.businessTypeService.reorderBusinessTypes(items);
        return { success: true };
    }
    async update(id, dto) {
        return this.businessTypeService.updateBusinessType(id, dto);
    }
    async delete(id) {
        await this.businessTypeService.deleteBusinessType(id);
        return { success: true };
    }
    async getFields(businessTypeId, activeOnly) {
        if (activeOnly === 'true') {
            return this.businessTypeService.findActiveFieldsByBusinessType(businessTypeId);
        }
        return this.businessTypeService.findFieldsByBusinessType(businessTypeId);
    }
    async createField(businessTypeId, dto) {
        return this.businessTypeService.createFieldDefinition({
            ...dto,
            businessTypeId,
        });
    }
    async reorderFields(items) {
        await this.businessTypeService.reorderFields(items);
        return { success: true };
    }
    async getField(fieldId) {
        return this.businessTypeService.findOneFieldDefinition(fieldId);
    }
    async updateField(fieldId, dto) {
        return this.businessTypeService.updateFieldDefinition(fieldId, dto);
    }
    async deleteField(fieldId) {
        await this.businessTypeService.deleteFieldDefinition(fieldId);
        return { success: true };
    }
};
exports.BusinessTypeController = BusinessTypeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateBusinessTypeDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "reorder", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateBusinessTypeDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':businessTypeId/fields'),
    __param(0, (0, common_1.Param)('businessTypeId')),
    __param(1, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getFields", null);
__decorate([
    (0, common_1.Post)(':businessTypeId/fields'),
    __param(0, (0, common_1.Param)('businessTypeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "createField", null);
__decorate([
    (0, common_1.Put)(':businessTypeId/fields/reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "reorderFields", null);
__decorate([
    (0, common_1.Get)('fields/:fieldId'),
    __param(0, (0, common_1.Param)('fieldId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "getField", null);
__decorate([
    (0, common_1.Put)('fields/:fieldId'),
    __param(0, (0, common_1.Param)('fieldId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateFieldDefinitionDto]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "updateField", null);
__decorate([
    (0, common_1.Delete)('fields/:fieldId'),
    __param(0, (0, common_1.Param)('fieldId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BusinessTypeController.prototype, "deleteField", null);
exports.BusinessTypeController = BusinessTypeController = __decorate([
    (0, common_1.Controller)('business-types'),
    __metadata("design:paramtypes", [business_type_service_1.BusinessTypeService])
], BusinessTypeController);
//# sourceMappingURL=business-type.controller.js.map