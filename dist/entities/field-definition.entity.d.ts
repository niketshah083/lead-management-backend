import { BusinessType } from './business-type.entity';
export declare enum FieldType {
    TEXT = "text",
    NUMBER = "number",
    DATE = "date",
    DROPDOWN = "dropdown",
    MULTI_SELECT = "multi_select",
    CHECKBOX = "checkbox",
    EMAIL = "email",
    PHONE = "phone",
    URL = "url",
    TEXTAREA = "textarea",
    CURRENCY = "currency"
}
export declare class FieldDefinition {
    id: string;
    businessTypeId: string;
    businessType: BusinessType;
    name: string;
    label: string;
    fieldType: FieldType;
    placeholder: string;
    helpText: string;
    isRequired: boolean;
    isActive: boolean;
    order: number;
    options: {
        label: string;
        value: string;
    }[];
    validation: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
        patternMessage?: string;
    };
    defaultValue: string;
    visibilityCondition: {
        dependsOn?: string;
        showWhen?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
