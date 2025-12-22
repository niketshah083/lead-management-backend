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
exports.UpdateLeadStatusDto = exports.LeadFilterDto = exports.LeadDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../enums");
const category_dto_1 = require("./category.dto");
const user_dto_1 = require("./user.dto");
class LeadDto {
    id;
    phoneNumber;
    name;
    categoryId;
    category;
    status;
    assignedToId;
    assignedTo;
    claimedAt;
    isQualified;
    createdAt;
    updatedAt;
}
exports.LeadDto = LeadDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LeadDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], LeadDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => category_dto_1.CategoryDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", category_dto_1.CategoryDto)
], LeadDto.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(enums_1.LeadStatus),
    __metadata("design:type", String)
], LeadDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LeadDto.prototype, "assignedToId", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => user_dto_1.UserDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", user_dto_1.UserDto)
], LeadDto.prototype, "assignedTo", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LeadDto.prototype, "claimedAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], LeadDto.prototype, "isQualified", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LeadDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LeadDto.prototype, "updatedAt", void 0);
class LeadFilterDto {
    status;
    categoryId;
    assignedToId;
    dateFrom;
    dateTo;
}
exports.LeadFilterDto = LeadFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(enums_1.LeadStatus, { each: true }),
    __metadata("design:type", Array)
], LeadFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "assignedToId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LeadFilterDto.prototype, "dateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], LeadFilterDto.prototype, "dateTo", void 0);
class UpdateLeadStatusDto {
    status;
    notes;
}
exports.UpdateLeadStatusDto = UpdateLeadStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.LeadStatus),
    __metadata("design:type", String)
], UpdateLeadStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadStatusDto.prototype, "notes", void 0);
//# sourceMappingURL=lead.dto.js.map