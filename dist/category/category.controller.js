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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const category_service_1 = require("./category.service");
const category_dto_1 = require("../common/dto/category.dto");
const decorators_1 = require("../auth/decorators");
const guards_1 = require("../auth/guards");
const enums_1 = require("../common/enums");
let CategoryController = class CategoryController {
    categoryService;
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    async create(createCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }
    async findAll() {
        return this.categoryService.findAll();
    }
    async findOne(id) {
        return this.categoryService.findOne(id);
    }
    async update(id, updateCategoryDto) {
        return this.categoryService.update(id, updateCategoryDto);
    }
    async delete(id) {
        return this.categoryService.softDelete(id);
    }
    async uploadMedia(id, files) {
        return this.categoryService.uploadMedia(id, files);
    }
    async getMedia(id) {
        return this.categoryService.getMedia(id);
    }
    async deleteMedia(categoryId, mediaId) {
        return this.categoryService.deleteMedia(categoryId, mediaId);
    }
};
exports.CategoryController = CategoryController;
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/media'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        limits: {
            fileSize: 100 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Get)(':id/media'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Delete)(':categoryId/media/:mediaId'),
    (0, decorators_1.Roles)(enums_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('categoryId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('mediaId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "deleteMedia", null);
exports.CategoryController = CategoryController = __decorate([
    (0, common_1.Controller)('categories'),
    (0, common_1.UseGuards)(guards_1.RolesGuard),
    __metadata("design:paramtypes", [category_service_1.CategoryService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map