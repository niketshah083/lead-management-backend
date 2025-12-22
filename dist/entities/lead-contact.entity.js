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
exports.LeadContact = void 0;
const typeorm_1 = require("typeorm");
const lead_entity_1 = require("./lead.entity");
let LeadContact = class LeadContact {
    id;
    leadId;
    lead;
    name;
    designation;
    phone;
    email;
    isPrimary;
    createdAt;
    updatedAt;
};
exports.LeadContact = LeadContact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeadContact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id' }),
    __metadata("design:type", String)
], LeadContact.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, (lead) => lead.contacts),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], LeadContact.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LeadContact.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadContact.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadContact.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LeadContact.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], LeadContact.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LeadContact.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LeadContact.prototype, "updatedAt", void 0);
exports.LeadContact = LeadContact = __decorate([
    (0, typeorm_1.Entity)('lead_contacts')
], LeadContact);
//# sourceMappingURL=lead-contact.entity.js.map