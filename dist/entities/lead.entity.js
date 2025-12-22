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
exports.Lead = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const category_entity_1 = require("./category.entity");
const user_entity_1 = require("./user.entity");
const message_entity_1 = require("./message.entity");
const sla_tracking_entity_1 = require("./sla-tracking.entity");
const lead_history_entity_1 = require("./lead-history.entity");
const lead_contact_entity_1 = require("./lead-contact.entity");
const lead_status_master_entity_1 = require("./lead-status-master.entity");
const business_type_entity_1 = require("./business-type.entity");
const lead_custom_field_entity_1 = require("./lead-custom-field.entity");
let Lead = class Lead {
    id;
    phoneNumber;
    name;
    businessName;
    email;
    pincode;
    source;
    addressLine1;
    addressLine2;
    city;
    state;
    country;
    categoryId;
    category;
    status;
    statusMasterId;
    statusMaster;
    assignedToId;
    assignedTo;
    claimedAt;
    isQualified;
    messages;
    slaTracking;
    history;
    contacts;
    businessTypeId;
    businessType;
    customFields;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Lead = Lead;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Lead.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number' }),
    __metadata("design:type", String)
], Lead.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "addressLine2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', nullable: true }),
    __metadata("design:type", Object)
], Lead.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Lead.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.LeadStatus, default: enums_1.LeadStatus.NEW }),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status_master_id', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "statusMasterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_status_master_entity_1.LeadStatusMaster),
    (0, typeorm_1.JoinColumn)({ name: 'status_master_id' }),
    __metadata("design:type", lead_status_master_entity_1.LeadStatusMaster)
], Lead.prototype, "statusMaster", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to_id', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "assignedToId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to_id' }),
    __metadata("design:type", user_entity_1.User)
], Lead.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'claimed_at', nullable: true }),
    __metadata("design:type", Date)
], Lead.prototype, "claimedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_qualified', default: false }),
    __metadata("design:type", Boolean)
], Lead.prototype, "isQualified", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.lead),
    __metadata("design:type", Array)
], Lead.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => sla_tracking_entity_1.SlaTracking, (sla) => sla.lead),
    __metadata("design:type", sla_tracking_entity_1.SlaTracking)
], Lead.prototype, "slaTracking", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_history_entity_1.LeadHistory, (history) => history.lead),
    __metadata("design:type", Array)
], Lead.prototype, "history", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_contact_entity_1.LeadContact, (contact) => contact.lead),
    __metadata("design:type", Array)
], Lead.prototype, "contacts", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_type_id', nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "businessTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_type_entity_1.BusinessType),
    (0, typeorm_1.JoinColumn)({ name: 'business_type_id' }),
    __metadata("design:type", business_type_entity_1.BusinessType)
], Lead.prototype, "businessType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_custom_field_entity_1.LeadCustomField, (cf) => cf.lead),
    __metadata("design:type", Array)
], Lead.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Lead.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Lead.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], Lead.prototype, "deletedAt", void 0);
exports.Lead = Lead = __decorate([
    (0, typeorm_1.Entity)('leads')
], Lead);
//# sourceMappingURL=lead.entity.js.map