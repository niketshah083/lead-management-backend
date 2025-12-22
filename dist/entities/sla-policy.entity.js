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
exports.SlaPolicy = void 0;
const typeorm_1 = require("typeorm");
let SlaPolicy = class SlaPolicy {
    id;
    name;
    firstResponseMinutes;
    followUpMinutes;
    resolutionMinutes;
    warningThresholdPercent;
    isDefault;
    isActive;
    createdAt;
    updatedAt;
};
exports.SlaPolicy = SlaPolicy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SlaPolicy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SlaPolicy.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_response_minutes' }),
    __metadata("design:type", Number)
], SlaPolicy.prototype, "firstResponseMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'follow_up_minutes' }),
    __metadata("design:type", Number)
], SlaPolicy.prototype, "followUpMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_minutes' }),
    __metadata("design:type", Number)
], SlaPolicy.prototype, "resolutionMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'warning_threshold_percent', default: 80 }),
    __metadata("design:type", Number)
], SlaPolicy.prototype, "warningThresholdPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    __metadata("design:type", Boolean)
], SlaPolicy.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SlaPolicy.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SlaPolicy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SlaPolicy.prototype, "updatedAt", void 0);
exports.SlaPolicy = SlaPolicy = __decorate([
    (0, typeorm_1.Entity)('sla_policies')
], SlaPolicy);
//# sourceMappingURL=sla-policy.entity.js.map