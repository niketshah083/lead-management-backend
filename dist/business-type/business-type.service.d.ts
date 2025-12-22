import { Repository } from 'typeorm';
import { BusinessType, FieldDefinition, LeadCustomField } from '../entities';
import { CreateBusinessTypeDto, UpdateBusinessTypeDto, CreateFieldDefinitionDto, UpdateFieldDefinitionDto, SetCustomFieldValueDto } from './dto';
export declare class BusinessTypeService {
    private readonly businessTypeRepository;
    private readonly fieldDefinitionRepository;
    private readonly leadCustomFieldRepository;
    private readonly logger;
    constructor(businessTypeRepository: Repository<BusinessType>, fieldDefinitionRepository: Repository<FieldDefinition>, leadCustomFieldRepository: Repository<LeadCustomField>);
    findAllBusinessTypes(): Promise<BusinessType[]>;
    findActiveBusinessTypes(): Promise<BusinessType[]>;
    findOneBusinessType(id: string): Promise<BusinessType>;
    createBusinessType(dto: CreateBusinessTypeDto): Promise<BusinessType>;
    updateBusinessType(id: string, dto: UpdateBusinessTypeDto): Promise<BusinessType>;
    deleteBusinessType(id: string): Promise<void>;
    reorderBusinessTypes(items: {
        id: string;
        order: number;
    }[]): Promise<void>;
    findFieldsByBusinessType(businessTypeId: string): Promise<FieldDefinition[]>;
    findActiveFieldsByBusinessType(businessTypeId: string): Promise<FieldDefinition[]>;
    findOneFieldDefinition(id: string): Promise<FieldDefinition>;
    createFieldDefinition(dto: CreateFieldDefinitionDto): Promise<FieldDefinition>;
    updateFieldDefinition(id: string, dto: UpdateFieldDefinitionDto): Promise<FieldDefinition>;
    deleteFieldDefinition(id: string): Promise<void>;
    reorderFields(items: {
        id: string;
        order: number;
    }[]): Promise<void>;
    getLeadCustomFields(leadId: string): Promise<LeadCustomField[]>;
    setLeadCustomField(leadId: string, dto: SetCustomFieldValueDto): Promise<LeadCustomField>;
    bulkSetLeadCustomFields(leadId: string, fields: SetCustomFieldValueDto[]): Promise<LeadCustomField[]>;
    deleteLeadCustomField(leadId: string, fieldDefinitionId: string): Promise<void>;
}
