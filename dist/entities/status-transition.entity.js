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
exports.StatusTransition = void 0;
const typeorm_1 = require("typeorm");
const lead_status_master_entity_1 = require("./lead-status-master.entity");
let StatusTransition = class StatusTransition {
    id;
    fromStatusId;
    fromStatus;
    toStatusId;
    toStatus;
    isActive;
    requiresComment;
    allowedRoles;
    createdAt;
    updatedAt;
};
exports.StatusTransition = StatusTransition;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StatusTransition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_status_id' }),
    __metadata("design:type", String)
], StatusTransition.prototype, "fromStatusId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_status_master_entity_1.LeadStatusMaster),
    (0, typeorm_1.JoinColumn)({ name: 'from_status_id' }),
    __metadata("design:type", lead_status_master_entity_1.LeadStatusMaster)
], StatusTransition.prototype, "fromStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_status_id' }),
    __metadata("design:type", String)
], StatusTransition.prototype, "toStatusId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_status_master_entity_1.LeadStatusMaster),
    (0, typeorm_1.JoinColumn)({ name: 'to_status_id' }),
    __metadata("design:type", lead_status_master_entity_1.LeadStatusMaster)
], StatusTransition.prototype, "toStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], StatusTransition.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], StatusTransition.prototype, "requiresComment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], StatusTransition.prototype, "allowedRoles", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StatusTransition.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StatusTransition.prototype, "updatedAt", void 0);
exports.StatusTransition = StatusTransition = __decorate([
    (0, typeorm_1.Entity)('status_transitions'),
    (0, typeorm_1.Unique)(['fromStatusId', 'toStatusId'])
], StatusTransition);
//# sourceMappingURL=status-transition.entity.js.map