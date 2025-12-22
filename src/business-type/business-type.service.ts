import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BusinessType, FieldDefinition, LeadCustomField } from '../entities';
import {
  CreateBusinessTypeDto,
  UpdateBusinessTypeDto,
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  SetCustomFieldValueDto,
} from './dto';

@Injectable()
export class BusinessTypeService {
  private readonly logger = new Logger(BusinessTypeService.name);

  constructor(
    @InjectRepository(BusinessType)
    private readonly businessTypeRepository: Repository<BusinessType>,
    @InjectRepository(FieldDefinition)
    private readonly fieldDefinitionRepository: Repository<FieldDefinition>,
    @InjectRepository(LeadCustomField)
    private readonly leadCustomFieldRepository: Repository<LeadCustomField>,
  ) {}

  // ============ Business Type Methods ============

  async findAllBusinessTypes(): Promise<BusinessType[]> {
    return this.businessTypeRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['fields'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findActiveBusinessTypes(): Promise<BusinessType[]> {
    return this.businessTypeRepository.find({
      where: { isActive: true, deletedAt: IsNull() },
      relations: ['fields'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findOneBusinessType(id: string): Promise<BusinessType> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['fields'],
    });

    if (!businessType) {
      throw new NotFoundException(`Business type with ID ${id} not found`);
    }

    // Sort fields by order
    if (businessType.fields) {
      businessType.fields = businessType.fields
        .filter((f) => !f.deletedAt)
        .sort((a, b) => a.order - b.order);
    }

    return businessType;
  }

  async createBusinessType(dto: CreateBusinessTypeDto): Promise<BusinessType> {
    // Check for duplicate name
    const existing = await this.businessTypeRepository.findOne({
      where: { name: dto.name, deletedAt: IsNull() },
    });

    if (existing) {
      throw new ConflictException(
        `Business type with name "${dto.name}" already exists`,
      );
    }

    const businessType = this.businessTypeRepository.create(dto);
    const saved = await this.businessTypeRepository.save(businessType);
    this.logger.log(`Created business type: ${saved.name}`);
    return saved;
  }

  async updateBusinessType(
    id: string,
    dto: UpdateBusinessTypeDto,
  ): Promise<BusinessType> {
    const businessType = await this.findOneBusinessType(id);

    // Check for duplicate name if name is being changed
    if (dto.name && dto.name !== businessType.name) {
      const existing = await this.businessTypeRepository.findOne({
        where: { name: dto.name, deletedAt: IsNull() },
      });
      if (existing) {
        throw new ConflictException(
          `Business type with name "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(businessType, dto);
    const updated = await this.businessTypeRepository.save(businessType);
    this.logger.log(`Updated business type: ${updated.name}`);
    return updated;
  }

  async deleteBusinessType(id: string): Promise<void> {
    const businessType = await this.findOneBusinessType(id);
    await this.businessTypeRepository.softRemove(businessType);
    this.logger.log(`Deleted business type: ${businessType.name}`);
  }

  async reorderBusinessTypes(
    items: { id: string; order: number }[],
  ): Promise<void> {
    for (const item of items) {
      await this.businessTypeRepository.update(item.id, { order: item.order });
    }
    this.logger.log('Reordered business types');
  }

  // ============ Field Definition Methods ============

  async findFieldsByBusinessType(
    businessTypeId: string,
  ): Promise<FieldDefinition[]> {
    return this.fieldDefinitionRepository.find({
      where: { businessTypeId, deletedAt: IsNull() },
      order: { order: 'ASC' },
    });
  }

  async findActiveFieldsByBusinessType(
    businessTypeId: string,
  ): Promise<FieldDefinition[]> {
    return this.fieldDefinitionRepository.find({
      where: { businessTypeId, isActive: true, deletedAt: IsNull() },
      order: { order: 'ASC' },
    });
  }

  async findOneFieldDefinition(id: string): Promise<FieldDefinition> {
    const field = await this.fieldDefinitionRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['businessType'],
    });

    if (!field) {
      throw new NotFoundException(`Field definition with ID ${id} not found`);
    }

    return field;
  }

  async createFieldDefinition(
    dto: CreateFieldDefinitionDto,
  ): Promise<FieldDefinition> {
    // Verify business type exists
    await this.findOneBusinessType(dto.businessTypeId);

    const field = this.fieldDefinitionRepository.create(dto);
    const saved = await this.fieldDefinitionRepository.save(field);
    this.logger.log(
      `Created field definition: ${saved.label} for business type ${dto.businessTypeId}`,
    );
    return saved;
  }

  async updateFieldDefinition(
    id: string,
    dto: UpdateFieldDefinitionDto,
  ): Promise<FieldDefinition> {
    const field = await this.findOneFieldDefinition(id);
    Object.assign(field, dto);
    const updated = await this.fieldDefinitionRepository.save(field);
    this.logger.log(`Updated field definition: ${updated.label}`);
    return updated;
  }

  async deleteFieldDefinition(id: string): Promise<void> {
    const field = await this.findOneFieldDefinition(id);
    await this.fieldDefinitionRepository.softRemove(field);
    this.logger.log(`Deleted field definition: ${field.label}`);
  }

  async reorderFields(items: { id: string; order: number }[]): Promise<void> {
    for (const item of items) {
      await this.fieldDefinitionRepository.update(item.id, {
        order: item.order,
      });
    }
    this.logger.log('Reordered field definitions');
  }

  // ============ Lead Custom Field Methods ============

  async getLeadCustomFields(leadId: string): Promise<LeadCustomField[]> {
    return this.leadCustomFieldRepository.find({
      where: { leadId },
      relations: ['fieldDefinition'],
    });
  }

  async setLeadCustomField(
    leadId: string,
    dto: SetCustomFieldValueDto,
  ): Promise<LeadCustomField> {
    // Verify field definition exists
    await this.findOneFieldDefinition(dto.fieldDefinitionId);

    let customField = await this.leadCustomFieldRepository.findOne({
      where: { leadId, fieldDefinitionId: dto.fieldDefinitionId },
    });

    if (customField) {
      customField.value = dto.value || undefined;
      customField.arrayValue = dto.arrayValue || undefined;
    } else {
      customField = this.leadCustomFieldRepository.create({
        leadId,
        fieldDefinitionId: dto.fieldDefinitionId,
        value: dto.value || undefined,
        arrayValue: dto.arrayValue || undefined,
      });
    }

    const saved = await this.leadCustomFieldRepository.save(customField);
    this.logger.log(
      `Set custom field ${dto.fieldDefinitionId} for lead ${leadId}`,
    );
    return saved;
  }

  async bulkSetLeadCustomFields(
    leadId: string,
    fields: SetCustomFieldValueDto[],
  ): Promise<LeadCustomField[]> {
    const results: LeadCustomField[] = [];

    for (const field of fields) {
      const result = await this.setLeadCustomField(leadId, field);
      results.push(result);
    }

    return results;
  }

  async deleteLeadCustomField(
    leadId: string,
    fieldDefinitionId: string,
  ): Promise<void> {
    const customField = await this.leadCustomFieldRepository.findOne({
      where: { leadId, fieldDefinitionId },
    });

    if (customField) {
      await this.leadCustomFieldRepository.remove(customField);
      this.logger.log(
        `Deleted custom field ${fieldDefinitionId} for lead ${leadId}`,
      );
    }
  }
}
