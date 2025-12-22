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
exports.ConnectorLogFilterDto = exports.ConnectorFilterDto = exports.WebhookPayloadDto = exports.TestWebhookDto = exports.OAuthCallbackDto = exports.ConnectorFieldMappingDto = exports.UpdateConnectorDto = exports.CreateConnectorDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../common/enums");
class CreateConnectorDto {
    name;
    type;
    description;
    config;
    fieldMapping;
    syncIntervalMinutes;
}
exports.CreateConnectorDto = CreateConnectorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConnectorDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.ConnectorType),
    __metadata("design:type", String)
], CreateConnectorDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConnectorDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateConnectorDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateConnectorDto.prototype, "fieldMapping", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], CreateConnectorDto.prototype, "syncIntervalMinutes", void 0);
class UpdateConnectorDto {
    name;
    description;
    config;
    fieldMapping;
    isActive;
    syncIntervalMinutes;
}
exports.UpdateConnectorDto = UpdateConnectorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConnectorDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConnectorDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateConnectorDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateConnectorDto.prototype, "fieldMapping", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateConnectorDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1440),
    __metadata("design:type", Number)
], UpdateConnectorDto.prototype, "syncIntervalMinutes", void 0);
class ConnectorFieldMappingDto {
    fieldMapping;
}
exports.ConnectorFieldMappingDto = ConnectorFieldMappingDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ConnectorFieldMappingDto.prototype, "fieldMapping", void 0);
class OAuthCallbackDto {
    code;
    state;
}
exports.OAuthCallbackDto = OAuthCallbackDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OAuthCallbackDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OAuthCallbackDto.prototype, "state", void 0);
class TestWebhookDto {
    payload;
}
exports.TestWebhookDto = TestWebhookDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestWebhookDto.prototype, "payload", void 0);
class WebhookPayloadDto {
}
exports.WebhookPayloadDto = WebhookPayloadDto;
class ConnectorFilterDto {
    type;
    isActive;
    page;
    limit;
}
exports.ConnectorFilterDto = ConnectorFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ConnectorType),
    __metadata("design:type", String)
], ConnectorFilterDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConnectorFilterDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConnectorFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConnectorFilterDto.prototype, "limit", void 0);
class ConnectorLogFilterDto {
    connectorId;
    level;
    action;
    page;
    limit;
}
exports.ConnectorLogFilterDto = ConnectorLogFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ConnectorLogFilterDto.prototype, "connectorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectorLogFilterDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectorLogFilterDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConnectorLogFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConnectorLogFilterDto.prototype, "limit", void 0);
//# sourceMappingURL=index.js.map