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
exports.Message = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const lead_entity_1 = require("./lead.entity");
const user_entity_1 = require("./user.entity");
let Message = class Message {
    id;
    leadId;
    lead;
    direction;
    content;
    mediaUrl;
    mediaType;
    sentById;
    sentBy;
    status;
    isAutoReply;
    createdAt;
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id' }),
    __metadata("design:type", String)
], Message.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lead_entity_1.Lead, (lead) => lead.messages),
    (0, typeorm_1.JoinColumn)({ name: 'lead_id' }),
    __metadata("design:type", lead_entity_1.Lead)
], Message.prototype, "lead", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.MessageDirection }),
    __metadata("design:type", String)
], Message.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_url', nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "mediaUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'media_type', type: 'enum', enum: enums_1.MediaType, nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "mediaType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sent_by_id', nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "sentById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'sent_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Message.prototype, "sentBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.MessageStatus, default: enums_1.MessageStatus.PENDING }),
    __metadata("design:type", String)
], Message.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_auto_reply', default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isAutoReply", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)('messages')
], Message);
//# sourceMappingURL=message.entity.js.map