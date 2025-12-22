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
exports.SlaTracking = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("./lead.entity");
const sla_policy_entity_1 = require("./sla-policy.entity");
let SlaTracking = class SlaTracking {
    id;
    leadId;
    lead;
    policyId;
    policy;
    firstResponseDue;
    firstResponseAt;
    firstResponseBreached;
    resolutionDue;
    resolvedAt;
    resolutionBreached;
    createdAt;
    updatedAt;
};
exports.SlaTracking = SlaTracking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SlaTracking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id' }),
    __metadata("design:type", String)
], SlaTracking.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => lead_entity_1.Lead, (lead) => lead.slaTracking),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], SlaTracking.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'policy_id' }),
    __metadata("design:type", String)
], SlaTracking.prototype, "policyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sla_policy_entity_1.SlaPolicy),
    (0, typeorm_1.JoinColumn)({ name: 'policy_id' }),
    __metadata("design:type", sla_policy_entity_1.SlaPolicy)
], SlaTracking.prototype, "policy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_response_due' }),
    __metadata("design:type", Date)
], SlaTracking.prototype, "firstResponseDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_response_at', nullable: true }),
    __metadata("design:type", Date)
], SlaTracking.prototype, "firstResponseAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_response_breached', default: false }),
    __metadata("design:type", Boolean)
], SlaTracking.prototype, "firstResponseBreached", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_due' }),
    __metadata("design:type", Date)
], SlaTracking.prototype, "resolutionDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', nullable: true }),
    __metadata("design:type", Date)
], SlaTracking.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_breached', default: false }),
    __metadata("design:type", Boolean)
], SlaTracking.prototype, "resolutionBreached", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SlaTracking.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SlaTracking.prototype, "updatedAt", void 0);
exports.SlaTracking = SlaTracking = __decorate([
    (0, typeorm_1.Entity)('sla_tracking')
], SlaTracking);
//# sourceMappingURL=sla-tracking.entity.js.map