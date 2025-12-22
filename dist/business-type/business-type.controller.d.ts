import { BusinessTypeService } from './business-type.service';
import { CreateBusinessTypeDto, UpdateBusinessTypeDto, CreateFieldDefinitionDto, UpdateFieldDefinitionDto } from './dto';
export declare class BusinessTypeController {
    private readonly businessTypeService;
    constructor(businessTypeService: BusinessTypeService);
    findAll(activeOnly?: string): Promise<import("../entities").BusinessType[]>;
    findOne(id: string): Promise<import("../entities").BusinessType>;
    create(dto: CreateBusinessTypeDto): Promise<import("../entities").BusinessType>;
    reorder(items: {
        id: string;
        order: number;
    }[]): Promise<{
        success: boolean;
    }>;
    update(id: string, dto: UpdateBusinessTypeDto): Promise<import("../entities").BusinessType>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    getFields(businessTypeId: string, activeOnly?: string): Promise<import("../entities").FieldDefinition[]>;
    createField(businessTypeId: string, dto: Omit<CreateFieldDefinitionDto, 'businessTypeId'>): Promise<import("../entities").FieldDefinition>;
    reorderFields(items: {
        id: string;
        order: number;
    }[]): Promise<{
        success: boolean;
    }>;
    getField(fieldId: string): Promise<import("../entities").FieldDefinition>;
    updateField(fieldId: string, dto: UpdateFieldDefinitionDto): Promise<import("../entities").FieldDefinition>;
    deleteField(fieldId: string): Promise<{
        success: boolean;
    }>;
}
