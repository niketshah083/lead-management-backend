import { FieldDefinition } from './field-definition.entity';
export declare class BusinessType {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
    order: number;
    fields: FieldDefinition[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
