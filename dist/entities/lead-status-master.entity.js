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
exports.LeadStatusMaster = void 0;
const typeorm_1 = require("typeorm");
let LeadStatusMaster = class LeadStatusMaster {
    id;
    name;
    description;
    color;
    bgColor;
    icon;
    order;
    isActive;
    isInitial;
    isFinal;
    statusType;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.LeadStatusMaster = LeadStatusMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#3B82F6' }),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#EFF6FF' }),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "bgColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pi-inbox' }),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], LeadStatusMaster.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LeadStatusMaster.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeadStatusMaster.prototype, "isInitial", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeadStatusMaster.prototype, "isFinal", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadStatusMaster.prototype, "statusType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LeadStatusMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LeadStatusMaster.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], LeadStatusMaster.prototype, "deletedAt", void 0);
exports.LeadStatusMaster = LeadStatusMaster = __decorate([
    (0, typeorm_1.Entity)('lead_status_masters')
], LeadStatusMaster);
//# sourceMappingURL=lead-status-master.entity.js.map