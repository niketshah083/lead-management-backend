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
exports.LeadHistory = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const lead_entity_1 = require("./lead.entity");
const user_entity_1 = require("./user.entity");
let LeadHistory = class LeadHistory {
    id;
    leadId;
    lead;
    previousStatus;
    newStatus;
    changedById;
    changedBy;
    notes;
    createdAt;
};
exports.LeadHistory = LeadHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeadHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id' }),
    __metadata("design:type", String)
], LeadHistory.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, (lead) => lead.history),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], LeadHistory.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'previous_status',
        type: 'enum',
        enum: enums_1.LeadStatus,
        nullable: true,
    }),
    __metadata("design:type", String)
], LeadHistory.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_status', type: 'enum', enum: enums_1.LeadStatus }),
    __metadata("design:type", String)
], LeadHistory.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'changed_by_id' }),
    __metadata("design:type", String)
], LeadHistory.prototype, "changedById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'changed_by_id' }),
    __metadata("design:type", user_entity_1.User)
], LeadHistory.prototype, "changedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LeadHistory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LeadHistory.prototype, "createdAt", void 0);
exports.LeadHistory = LeadHistory = __decorate([
    (0, typeorm_1.Entity)('lead_history')
], LeadHistory);
//# sourceMappingURL=lead-history.entity.js.map