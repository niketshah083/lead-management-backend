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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkSetCustomFieldsDto = exports.SetCustomFieldValueDto = exports.UpdateFieldDefinitionDto = exports.CreateFieldDefinitionDto = exports.VisibilityConditionDto = exports.FieldValidationDto = exports.FieldOptionDto = exports.UpdateBusinessTypeDto = exports.CreateBusinessTypeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const field_definition_entity_1 = require("../../entities/field-definition.entity");
class CreateBusinessTypeDto {
    name;
    description;
    icon;
    color;
}
exports.CreateBusinessTypeDto = CreateBusinessTypeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessTypeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessTypeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessTypeDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessTypeDto.prototype, "color", void 0);
class UpdateBusinessTypeDto {
    name;
    description;
    icon;
    color;
    isActive;
    order;
}
exports.UpdateBusinessTypeDto = UpdateBusinessTypeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessTypeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessTypeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessTypeDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBusinessTypeDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateBusinessTypeDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateBusinessTypeDto.prototype, "order", void 0);
class FieldOptionDto {
    label;
    value;
}
exports.FieldOptionDto = FieldOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FieldOptionDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FieldOptionDto.prototype, "value", void 0);
class FieldValidationDto {
    minLength;
    maxLength;
    min;
    max;
    pattern;
    patternMessage;
}
exports.FieldValidationDto = FieldValidationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FieldValidationDto.prototype, "minLength", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FieldValidationDto.prototype, "maxLength", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FieldValidationDto.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FieldValidationDto.prototype, "max", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FieldValidationDto.prototype, "pattern", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FieldValidationDto.prototype, "patternMessage", void 0);
class VisibilityConditionDto {
    dependsOn;
    showWhen;
}
exports.VisibilityConditionDto = VisibilityConditionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VisibilityConditionDto.prototype, "dependsOn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], VisibilityConditionDto.prototype, "showWhen", void 0);
class CreateFieldDefinitionDto {
    businessTypeId;
    name;
    label;
    fieldType;
    placeholder;
    helpText;
    isRequired;
    order;
    options;
    validation;
    defaultValue;
    visibilityCondition;
}
exports.CreateFieldDefinitionDto = CreateFieldDefinitionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "businessTypeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(field_definition_entity_1.FieldType),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "fieldType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "placeholder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "helpText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateFieldDefinitionDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFieldDefinitionDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FieldOptionDto),
    __metadata("design:type", Array)
], CreateFieldDefinitionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldValidationDto),
    __metadata("design:type", FieldValidationDto)
], CreateFieldDefinitionDto.prototype, "validation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFieldDefinitionDto.prototype, "defaultValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VisibilityConditionDto),
    __metadata("design:type", VisibilityConditionDto)
], CreateFieldDefinitionDto.prototype, "visibilityCondition", void 0);
class UpdateFieldDefinitionDto {
    name;
    label;
    fieldType;
    placeholder;
    helpText;
    isRequired;
    isActive;
    order;
    options;
    validation;
    defaultValue;
    visibilityCondition;
}
exports.UpdateFieldDefinitionDto = UpdateFieldDefinitionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFieldDefinitionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFieldDefinitionDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(field_definition_entity_1.FieldType),
    __metadata("design:type", String)
], UpdateFieldDefinitionDto.prototype, "fieldType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFieldDefinitionDto.prototype, "placeholder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFieldDefinitionDto.prototype, "helpText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateFieldDefinitionDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateFieldDefinitionDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateFieldDefinitionDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FieldOptionDto),
    __metadata("design:type", Array)
], UpdateFieldDefinitionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FieldValidationDto),
    __metadata("design:type", FieldValidationDto)
], UpdateFieldDefinitionDto.prototype, "validation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFieldDefinitionDto.prototype, "defaultValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VisibilityConditionDto),
    __metadata("design:type", VisibilityConditionDto)
], UpdateFieldDefinitionDto.prototype, "visibilityCondition", void 0);
class SetCustomFieldValueDto {
    fieldDefinitionId;
    value;
    arrayValue;
}
exports.SetCustomFieldValueDto = SetCustomFieldValueDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SetCustomFieldValueDto.prototype, "fieldDefinitionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetCustomFieldValueDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetCustomFieldValueDto.prototype, "arrayValue", void 0);
class BulkSetCustomFieldsDto {
    fields;
}
exports.BulkSetCustomFieldsDto = BulkSetCustomFieldsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SetCustomFieldValueDto),
    __metadata("design:type", Array)
], BulkSetCustomFieldsDto.prototype, "fields", void 0);
//# sourceMappingURL=index.js.map