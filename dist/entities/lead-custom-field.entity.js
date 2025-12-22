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
exports.LeadCustomField = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("./lead.entity");
const field_definition_entity_1 = require("./field-definition.entity");
let LeadCustomField = class LeadCustomField {
    id;
    leadId;
    lead;
    fieldDefinitionId;
    fieldDefinition;
    value;
    arrayValue;
    createdAt;
    updatedAt;
};
exports.LeadCustomField = LeadCustomField;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeadCustomField.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id' }),
    __metadata("design:type", String)
], LeadCustomField.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], LeadCustomField.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_definition_id' }),
    __metadata("design:type", String)
], LeadCustomField.prototype, "fieldDefinitionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => field_definition_entity_1.FieldDefinition),
    (0, typeorm_1.JoinColumn)({ name: 'field_definition_id' }),
    __metadata("design:type", field_definition_entity_1.FieldDefinition)
], LeadCustomField.prototype, "fieldDefinition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LeadCustomField.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], LeadCustomField.prototype, "arrayValue", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LeadCustomField.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LeadCustomField.prototype, "updatedAt", void 0);
exports.LeadCustomField = LeadCustomField = __decorate([
    (0, typeorm_1.Entity)('lead_custom_fields'),
    (0, typeorm_1.Unique)(['leadId', 'fieldDefinitionId'])
], LeadCustomField);
//# sourceMappingURL=lead-custom-field.entity.js.map