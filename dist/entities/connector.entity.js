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
exports.WebhookPayload = exports.ConnectorLog = exports.Connector = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const user_entity_1 = require("./user.entity");
let Connector = class Connector {
    id;
    name;
    type;
    status;
    description;
    webhookUrl;
    webhookSecret;
    oauthAccessToken;
    oauthRefreshToken;
    oauthExpiresAt;
    oauthScope;
    externalAccountId;
    externalAccountName;
    externalPageId;
    externalPageName;
    config;
    fieldMapping;
    isActive;
    lastSyncAt;
    lastError;
    syncIntervalMinutes;
    createdById;
    createdBy;
    logs;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Connector = Connector;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Connector.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Connector.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.ConnectorType }),
    __metadata("design:type", String)
], Connector.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.ConnectorStatus,
        default: enums_1.ConnectorStatus.DISCONNECTED,
    }),
    __metadata("design:type", String)
], Connector.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_url', length: 500, nullable: true, unique: true }),
    __metadata("design:type", String)
], Connector.prototype, "webhookUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'webhook_secret', length: 255, nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "webhookSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'oauth_access_token', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "oauthAccessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'oauth_refresh_token', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "oauthRefreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'oauth_expires_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Connector.prototype, "oauthExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'oauth_scope', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "oauthScope", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_account_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "externalAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_account_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "externalAccountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_page_id', length: 255, nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "externalPageId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'external_page_name', length: 255, nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "externalPageName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Connector.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'field_mapping', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Connector.prototype, "fieldMapping", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Connector.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_sync_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Connector.prototype, "lastSyncAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_error', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sync_interval_minutes', default: 15 }),
    __metadata("design:type", Number)
], Connector.prototype, "syncIntervalMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], Connector.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Connector.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ConnectorLog, (log) => log.connector),
    __metadata("design:type", Array)
], Connector.prototype, "logs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Connector.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Connector.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], Connector.prototype, "deletedAt", void 0);
exports.Connector = Connector = __decorate([
    (0, typeorm_1.Entity)('connectors')
], Connector);
let ConnectorLog = class ConnectorLog {
    id;
    connectorId;
    connector;
    action;
    level;
    message;
    rawPayload;
    processedData;
    leadId;
    errorDetails;
    ipAddress;
    createdAt;
};
exports.ConnectorLog = ConnectorLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConnectorLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'connector_id' }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "connectorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Connector, (connector) => connector.logs),
    (0, typeorm_1.JoinColumn)({ name: 'connector_id' }),
    __metadata("design:type", Connector)
], ConnectorLog.prototype, "connector", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['success', 'error', 'warning', 'info'],
        default: 'info',
    }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_payload', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ConnectorLog.prototype, "rawPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'processed_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ConnectorLog.prototype, "processedData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id', nullable: true }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_details', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "errorDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], ConnectorLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ConnectorLog.prototype, "createdAt", void 0);
exports.ConnectorLog = ConnectorLog = __decorate([
    (0, typeorm_1.Entity)('connector_logs')
], ConnectorLog);
let WebhookPayload = class WebhookPayload {
    id;
    connectorId;
    connector;
    rawPayload;
    normalizedData;
    status;
    leadId;
    errorMessage;
    ipAddress;
    userAgent;
    createdAt;
    processedAt;
};
exports.WebhookPayload = WebhookPayload;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookPayload.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'connector_id' }),
    __metadata("design:type", String)
], WebhookPayload.prototype, "connectorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Connector),
    (0, typeorm_1.JoinColumn)({ name: 'connector_id' }),
    __metadata("design:type", Connector)
], WebhookPayload.prototype, "connector", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'raw_payload', type: 'json' }),
    __metadata("design:type", Object)
], WebhookPayload.prototype, "rawPayload", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'normalized_data', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WebhookPayload.prototype, "normalizedData", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'processed', 'failed', 'duplicate'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], WebhookPayload.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lead_id', nullable: true }),
    __metadata("design:type", String)
], WebhookPayload.prototype, "leadId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WebhookPayload.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', length: 45, nullable: true }),
    __metadata("design:type", String)
], WebhookPayload.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", String)
], WebhookPayload.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], WebhookPayload.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'processed_at' }),
    __metadata("design:type", Date)
], WebhookPayload.prototype, "processedAt", void 0);
exports.WebhookPayload = WebhookPayload = __decorate([
    (0, typeorm_1.Entity)('webhook_payloads')
], WebhookPayload);
//# sourceMappingURL=connector.entity.js.map