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
exports.UpdateCategoryDto = exports.CreateCategoryDto = exports.CategoryDto = exports.AutoReplyTemplateDto = exports.MediaDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const enums_1 = require("../enums");
class MediaDto {
    id;
    url;
    signedUrl;
    type;
    filename;
    size;
}
exports.MediaDto = MediaDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MediaDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaDto.prototype, "url", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaDto.prototype, "signedUrl", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(enums_1.MediaType),
    __metadata("design:type", String)
], MediaDto.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MediaDto.prototype, "filename", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MediaDto.prototype, "size", void 0);
class AutoReplyTemplateDto {
    id;
    triggerKeyword;
    messageContent;
    priority;
    isActive;
}
exports.AutoReplyTemplateDto = AutoReplyTemplateDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AutoReplyTemplateDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoReplyTemplateDto.prototype, "triggerKeyword", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoReplyTemplateDto.prototype, "messageContent", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AutoReplyTemplateDto.prototype, "priority", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AutoReplyTemplateDto.prototype, "isActive", void 0);
class CategoryDto {
    id;
    name;
    description;
    keywords;
    media;
    autoReplyTemplates;
    isActive;
    createdAt;
    updatedAt;
}
exports.CategoryDto = CategoryDto;
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CategoryDto.prototype, "keywords", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => MediaDto),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CategoryDto.prototype, "media", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => AutoReplyTemplateDto),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CategoryDto.prototype, "autoReplyTemplates", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CategoryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CategoryDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CategoryDto.prototype, "updatedAt", void 0);
class CreateCategoryDto {
    name;
    description;
    keywords;
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCategoryDto.prototype, "keywords", void 0);
class UpdateCategoryDto {
    name;
    description;
    keywords;
    isActive;
}
exports.UpdateCategoryDto = UpdateCategoryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCategoryDto.prototype, "keywords", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCategoryDto.prototype, "isActive", void 0);
//# sourceMappingURL=category.dto.js.map