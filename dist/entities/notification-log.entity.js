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
exports.NotificationLog = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const notification_config_entity_1 = require("./notification-config.entity");
const user_entity_1 = require("./user.entity");
let NotificationLog = class NotificationLog {
    id;
    configId;
    config;
    userId;
    user;
    channel;
    subject;
    content;
    status;
    sentAt;
};
exports.NotificationLog = NotificationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config_id', nullable: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "configId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_config_entity_1.NotificationConfig),
    (0, typeorm_1.JoinColumn)({ name: 'config_id' }),
    __metadata("design:type", notification_config_entity_1.NotificationConfig)
], NotificationLog.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], NotificationLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], NotificationLog.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.NotificationChannel }),
    __metadata("design:type", String)
], NotificationLog.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationLog.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], NotificationLog.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.NotificationStatus,
        default: enums_1.NotificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'sent_at' }),
    __metadata("design:type", Date)
], NotificationLog.prototype, "sentAt", void 0);
exports.NotificationLog = NotificationLog = __decorate([
    (0, typeorm_1.Entity)('notification_logs')
], NotificationLog);
//# sourceMappingURL=notification-log.entity.js.map