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
exports.FieldDefinition = exports.FieldType = void 0;
const typeorm_1 = require("typeorm");
const business_type_entity_1 = require("./business-type.entity");
var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["NUMBER"] = "number";
    FieldType["DATE"] = "date";
    FieldType["DROPDOWN"] = "dropdown";
    FieldType["MULTI_SELECT"] = "multi_select";
    FieldType["CHECKBOX"] = "checkbox";
    FieldType["EMAIL"] = "email";
    FieldType["PHONE"] = "phone";
    FieldType["URL"] = "url";
    FieldType["TEXTAREA"] = "textarea";
    FieldType["CURRENCY"] = "currency";
})(FieldType || (exports.FieldType = FieldType = {}));
let FieldDefinition = class FieldDefinition {
    id;
    businessTypeId;
    businessType;
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
    createdAt;
    updatedAt;
    deletedAt;
};
exports.FieldDefinition = FieldDefinition;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FieldDefinition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_type_id' }),
    __metadata("design:type", String)
], FieldDefinition.prototype, "businessTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_type_entity_1.BusinessType, (bt) => bt.fields),
    (0, typeorm_1.JoinColumn)({ name: 'business_type_id' }),
    __metadata("design:type", business_type_entity_1.BusinessType)
], FieldDefinition.prototype, "businessType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FieldDefinition.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FieldDefinition.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FieldType, default: FieldType.TEXT }),
    __metadata("design:type", String)
], FieldDefinition.prototype, "fieldType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FieldDefinition.prototype, "placeholder", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FieldDefinition.prototype, "helpText", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FieldDefinition.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], FieldDefinition.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], FieldDefinition.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], FieldDefinition.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], FieldDefinition.prototype, "validation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FieldDefinition.prototype, "defaultValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], FieldDefinition.prototype, "visibilityCondition", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FieldDefinition.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FieldDefinition.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], FieldDefinition.prototype, "deletedAt", void 0);
exports.FieldDefinition = FieldDefinition = __decorate([
    (0, typeorm_1.Entity)('field_definitions')
], FieldDefinition);
//# sourceMappingURL=field-definition.entity.js.map