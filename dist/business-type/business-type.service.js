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
var BusinessTypeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
let BusinessTypeService = BusinessTypeService_1 = class BusinessTypeService {
    businessTypeRepository;
    fieldDefinitionRepository;
    leadCustomFieldRepository;
    logger = new common_1.Logger(BusinessTypeService_1.name);
    constructor(businessTypeRepository, fieldDefinitionRepository, leadCustomFieldRepository) {
        this.businessTypeRepository = businessTypeRepository;
        this.fieldDefinitionRepository = fieldDefinitionRepository;
        this.leadCustomFieldRepository = leadCustomFieldRepository;
    }
    async findAllBusinessTypes() {
        return this.businessTypeRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['fields'],
            order: { order: 'ASC', name: 'ASC' },
        });
    }
    async findActiveBusinessTypes() {
        return this.businessTypeRepository.find({
            where: { isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['fields'],
            order: { order: 'ASC', name: 'ASC' },
        });
    }
    async findOneBusinessType(id) {
        const businessType = await this.businessTypeRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['fields'],
        });
        if (!businessType) {
            throw new common_1.NotFoundException(`Business type with ID ${id} not found`);
        }
        if (businessType.fields) {
            businessType.fields = businessType.fields
                .filter((f) => !f.deletedAt)
                .sort((a, b) => a.order - b.order);
        }
        return businessType;
    }
    async createBusinessType(dto) {
        const existing = await this.businessTypeRepository.findOne({
            where: { name: dto.name, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (existing) {
            throw new common_1.ConflictException(`Business type with name "${dto.name}" already exists`);
        }
        const businessType = this.businessTypeRepository.create(dto);
        const saved = await this.businessTypeRepository.save(businessType);
        this.logger.log(`Created business type: ${saved.name}`);
        return saved;
    }
    async updateBusinessType(id, dto) {
        const businessType = await this.findOneBusinessType(id);
        if (dto.name && dto.name !== businessType.name) {
            const existing = await this.businessTypeRepository.findOne({
                where: { name: dto.name, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (existing) {
                throw new common_1.ConflictException(`Business type with name "${dto.name}" already exists`);
            }
        }
        Object.assign(businessType, dto);
        const updated = await this.businessTypeRepository.save(businessType);
        this.logger.log(`Updated business type: ${updated.name}`);
        return updated;
    }
    async deleteBusinessType(id) {
        const businessType = await this.findOneBusinessType(id);
        await this.businessTypeRepository.softRemove(businessType);
        this.logger.log(`Deleted business type: ${businessType.name}`);
    }
    async reorderBusinessTypes(items) {
        for (const item of items) {
            await this.businessTypeRepository.update(item.id, { order: item.order });
        }
        this.logger.log('Reordered business types');
    }
    async findFieldsByBusinessType(businessTypeId) {
        return this.fieldDefinitionRepository.find({
            where: { businessTypeId, deletedAt: (0, typeorm_2.IsNull)() },
            order: { order: 'ASC' },
        });
    }
    async findActiveFieldsByBusinessType(businessTypeId) {
        return this.fieldDefinitionRepository.find({
            where: { businessTypeId, isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
            order: { order: 'ASC' },
        });
    }
    async findOneFieldDefinition(id) {
        const field = await this.fieldDefinitionRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['businessType'],
        });
        if (!field) {
            throw new common_1.NotFoundException(`Field definition with ID ${id} not found`);
        }
        return field;
    }
    async createFieldDefinition(dto) {
        await this.findOneBusinessType(dto.businessTypeId);
        const field = this.fieldDefinitionRepository.create(dto);
        const saved = await this.fieldDefinitionRepository.save(field);
        this.logger.log(`Created field definition: ${saved.label} for business type ${dto.businessTypeId}`);
        return saved;
    }
    async updateFieldDefinition(id, dto) {
        const field = await this.findOneFieldDefinition(id);
        Object.assign(field, dto);
        const updated = await this.fieldDefinitionRepository.save(field);
        this.logger.log(`Updated field definition: ${updated.label}`);
        return updated;
    }
    async deleteFieldDefinition(id) {
        const field = await this.findOneFieldDefinition(id);
        await this.fieldDefinitionRepository.softRemove(field);
        this.logger.log(`Deleted field definition: ${field.label}`);
    }
    async reorderFields(items) {
        for (const item of items) {
            await this.fieldDefinitionRepository.update(item.id, {
                order: item.order,
            });
        }
        this.logger.log('Reordered field definitions');
    }
    async getLeadCustomFields(leadId) {
        return this.leadCustomFieldRepository.find({
            where: { leadId },
            relations: ['fieldDefinition'],
        });
    }
    async setLeadCustomField(leadId, dto) {
        await this.findOneFieldDefinition(dto.fieldDefinitionId);
        let customField = await this.leadCustomFieldRepository.findOne({
            where: { leadId, fieldDefinitionId: dto.fieldDefinitionId },
        });
        if (customField) {
            customField.value = dto.value || undefined;
            customField.arrayValue = dto.arrayValue || undefined;
        }
        else {
            customField = this.leadCustomFieldRepository.create({
                leadId,
                fieldDefinitionId: dto.fieldDefinitionId,
                value: dto.value || undefined,
                arrayValue: dto.arrayValue || undefined,
            });
        }
        const saved = await this.leadCustomFieldRepository.save(customField);
        this.logger.log(`Set custom field ${dto.fieldDefinitionId} for lead ${leadId}`);
        return saved;
    }
    async bulkSetLeadCustomFields(leadId, fields) {
        const results = [];
        for (const field of fields) {
            const result = await this.setLeadCustomField(leadId, field);
            results.push(result);
        }
        return results;
    }
    async deleteLeadCustomField(leadId, fieldDefinitionId) {
        const customField = await this.leadCustomFieldRepository.findOne({
            where: { leadId, fieldDefinitionId },
        });
        if (customField) {
            await this.leadCustomFieldRepository.remove(customField);
            this.logger.log(`Deleted custom field ${fieldDefinitionId} for lead ${leadId}`);
        }
    }
};
exports.BusinessTypeService = BusinessTypeService;
exports.BusinessTypeService = BusinessTypeService = BusinessTypeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.BusinessType)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.FieldDefinition)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.LeadCustomField)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessTypeService);
//# sourceMappingURL=business-type.service.js.map