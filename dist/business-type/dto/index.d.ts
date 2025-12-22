import { FieldType } from '../../entities/field-definition.entity';
export declare class CreateBusinessTypeDto {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}
export declare class UpdateBusinessTypeDto {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    order?: number;
}
export declare class FieldOptionDto {
    label: string;
    value: string;
}
export declare class FieldValidationDto {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
}
export declare class VisibilityConditionDto {
    dependsOn?: string;
    showWhen?: string[];
}
export declare class CreateFieldDefinitionDto {
    businessTypeId: string;
    name: string;
    label: string;
    fieldType: FieldType;
    placeholder?: string;
    helpText?: string;
    isRequired?: boolean;
    order?: number;
    options?: FieldOptionDto[];
    validation?: FieldValidationDto;
    defaultValue?: string;
    visibilityCondition?: VisibilityConditionDto;
}
export declare class UpdateFieldDefinitionDto {
    name?: string;
    label?: string;
    fieldType?: FieldType;
    placeholder?: string;
    helpText?: string;
    isRequired?: boolean;
    isActive?: boolean;
    order?: number;
    options?: FieldOptionDto[];
    validation?: FieldValidationDto;
    defaultValue?: string;
    visibilityCondition?: VisibilityConditionDto;
}
export declare class SetCustomFieldValueDto {
    fieldDefinitionId: string;
    value?: string;
    arrayValue?: string[];
}
export declare class BulkSetCustomFieldsDto {
    fields: SetCustomFieldValueDto[];
}
