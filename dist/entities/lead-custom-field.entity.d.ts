import { Lead } from './lead.entity';
import { FieldDefinition } from './field-definition.entity';
export declare class LeadCustomField {
    id: string;
    leadId: string;
    lead: Lead;
    fieldDefinitionId: string;
    fieldDefinition: FieldDefinition;
    value?: string;
    arrayValue?: string[];
    createdAt: Date;
    updatedAt: Date;
}
