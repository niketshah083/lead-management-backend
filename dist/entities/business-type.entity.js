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
exports.BusinessType = void 0;
const typeorm_1 = require("typeorm");
const field_definition_entity_1 = require("./field-definition.entity");
let BusinessType = class BusinessType {
    id;
    name;
    description;
    icon;
    color;
    isActive;
    order;
    fields;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.BusinessType = BusinessType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], BusinessType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BusinessType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pi-briefcase' }),
    __metadata("design:type", String)
], BusinessType.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#3B82F6' }),
    __metadata("design:type", String)
], BusinessType.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], BusinessType.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], BusinessType.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => field_definition_entity_1.FieldDefinition, (field) => field.businessType),
    __metadata("design:type", Array)
], BusinessType.prototype, "fields", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessType.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BusinessType.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], BusinessType.prototype, "deletedAt", void 0);
exports.BusinessType = BusinessType = __decorate([
    (0, typeorm_1.Entity)('business_types')
], BusinessType);
//# sourceMappingURL=business-type.entity.js.map