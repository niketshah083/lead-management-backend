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
exports.CategoryMedia = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const category_entity_1 = require("./category.entity");
let CategoryMedia = class CategoryMedia {
    id;
    categoryId;
    category;
    url;
    type;
    filename;
    size;
    createdAt;
};
exports.CategoryMedia = CategoryMedia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CategoryMedia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], CategoryMedia.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.media),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], CategoryMedia.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CategoryMedia.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.MediaType }),
    __metadata("design:type", String)
], CategoryMedia.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CategoryMedia.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CategoryMedia.prototype, "size", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CategoryMedia.prototype, "createdAt", void 0);
exports.CategoryMedia = CategoryMedia = __decorate([
    (0, typeorm_1.Entity)('category_media')
], CategoryMedia);
//# sourceMappingURL=category-media.entity.js.map