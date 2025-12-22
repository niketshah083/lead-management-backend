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
exports.AutoReplyTemplate = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./category.entity");
let AutoReplyTemplate = class AutoReplyTemplate {
    id;
    categoryId;
    category;
    triggerKeyword;
    messageContent;
    priority;
    isActive;
    createdAt;
    updatedAt;
};
exports.AutoReplyTemplate = AutoReplyTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AutoReplyTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], AutoReplyTemplate.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.autoReplyTemplates),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], AutoReplyTemplate.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trigger_keyword' }),
    __metadata("design:type", String)
], AutoReplyTemplate.prototype, "triggerKeyword", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'message_content', type: 'text' }),
    __metadata("design:type", String)
], AutoReplyTemplate.prototype, "messageContent", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], AutoReplyTemplate.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], AutoReplyTemplate.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AutoReplyTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AutoReplyTemplate.prototype, "updatedAt", void 0);
exports.AutoReplyTemplate = AutoReplyTemplate = __decorate([
    (0, typeorm_1.Entity)('auto_reply_templates')
], AutoReplyTemplate);
//# sourceMappingURL=auto-reply-template.entity.js.map