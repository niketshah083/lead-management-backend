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
var CategoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const category_entity_1 = require("../entities/category.entity");
const category_media_entity_1 = require("../entities/category-media.entity");
const category_dto_1 = require("../common/dto/category.dto");
const enums_1 = require("../common/enums");
const services_1 = require("../common/services");
const constants_1 = require("../common/constants");
let CategoryService = CategoryService_1 = class CategoryService {
    categoryRepository;
    categoryMediaRepository;
    s3Service;
    logger = new common_1.Logger(CategoryService_1.name);
    constructor(categoryRepository, categoryMediaRepository, s3Service) {
        this.categoryRepository = categoryRepository;
        this.categoryMediaRepository = categoryMediaRepository;
        this.s3Service = s3Service;
    }
    async create(createCategoryDto) {
        const existingCategory = await this.categoryRepository.findOne({
            where: { name: createCategoryDto.name },
            withDeleted: true,
        });
        if (existingCategory && !existingCategory.deletedAt) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        const category = this.categoryRepository.create({
            name: createCategoryDto.name,
            description: createCategoryDto.description,
            keywords: createCategoryDto.keywords,
            isActive: true,
        });
        const savedCategory = await this.categoryRepository.save(category);
        return this.toCategoryDto(savedCategory);
    }
    async findAll() {
        const categories = await this.categoryRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['media', 'autoReplyTemplates'],
            order: { createdAt: 'DESC' },
        });
        const categoriesWithSignedUrls = await Promise.all(categories.map(async (category) => {
            const dto = this.toCategoryDto(category);
            if (dto.media) {
                dto.media = await Promise.all(dto.media.map(async (m) => {
                    const signedUrl = await this.s3Service.getSignedUrl(m.url);
                    return {
                        ...m,
                        url: signedUrl,
                        signedUrl: signedUrl,
                    };
                }));
            }
            return dto;
        }));
        return categoriesWithSignedUrls;
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['media', 'autoReplyTemplates'],
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        const dto = this.toCategoryDto(category);
        if (dto.media) {
            dto.media = await Promise.all(dto.media.map(async (m) => {
                const signedUrl = await this.s3Service.getSignedUrl(m.url);
                return {
                    ...m,
                    url: signedUrl,
                    signedUrl: signedUrl,
                };
            }));
        }
        return dto;
    }
    async update(id, updateCategoryDto) {
        const category = await this.categoryRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['media', 'autoReplyTemplates'],
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const existingCategory = await this.categoryRepository.findOne({
                where: { name: updateCategoryDto.name },
            });
            if (existingCategory) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
        }
        Object.assign(category, updateCategoryDto);
        const savedCategory = await this.categoryRepository.save(category);
        return this.toCategoryDto(savedCategory);
    }
    async softDelete(id) {
        const category = await this.categoryRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        await this.categoryRepository.softRemove(category);
    }
    validateFileType(mimetype, filename, size) {
        const extension = filename
            .toLowerCase()
            .substring(filename.lastIndexOf('.'));
        if (constants_1.FileConstants.MIME_TYPES.IMAGE.includes(mimetype) &&
            constants_1.FileConstants.FILE_TYPE.IMAGE.includes(extension)) {
            if (size > constants_1.FileConstants.FILE_SIZE.TEN_MB) {
                return {
                    isValid: false,
                    mediaType: null,
                    error: 'Image file size exceeds 10MB limit',
                };
            }
            return { isValid: true, mediaType: enums_1.MediaType.IMAGE };
        }
        if (constants_1.FileConstants.MIME_TYPES.VIDEO.includes(mimetype) &&
            constants_1.FileConstants.FILE_TYPE.VIDEO.includes(extension)) {
            if (size > constants_1.FileConstants.FILE_SIZE.HUNDRED_MB) {
                return {
                    isValid: false,
                    mediaType: null,
                    error: 'Video file size exceeds 100MB limit',
                };
            }
            return { isValid: true, mediaType: enums_1.MediaType.VIDEO };
        }
        if (constants_1.FileConstants.MIME_TYPES.DOCUMENT.includes(mimetype) &&
            constants_1.FileConstants.FILE_TYPE.DOCUMENT.includes(extension)) {
            if (size > constants_1.FileConstants.FILE_SIZE.TWENTY_MB) {
                return {
                    isValid: false,
                    mediaType: null,
                    error: 'Document file size exceeds 20MB limit',
                };
            }
            return { isValid: true, mediaType: enums_1.MediaType.DOCUMENT };
        }
        return {
            isValid: false,
            mediaType: null,
            error: 'Invalid file type. Allowed: jpg/png/webp for images, mp4/webm for videos, pdf for documents',
        };
    }
    async uploadMedia(categoryId, files) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
        }
        const uploadedMedia = [];
        for (const file of files) {
            const validation = this.validateFileType(file.mimetype, file.originalname, file.size);
            if (!validation.isValid) {
                throw new common_1.BadRequestException(validation.error);
            }
            const folder = `categories/${categoryId}`;
            const uploadResult = await this.s3Service.uploadFile(file, folder);
            const media = this.categoryMediaRepository.create({
                categoryId,
                url: uploadResult.key,
                type: validation.mediaType,
                filename: file.originalname,
                size: file.size,
            });
            const savedMedia = await this.categoryMediaRepository.save(media);
            const mediaDto = this.toMediaDto(savedMedia);
            mediaDto.signedUrl = uploadResult.signedUrl;
            uploadedMedia.push(mediaDto);
        }
        return uploadedMedia;
    }
    async deleteMedia(categoryId, mediaId) {
        const media = await this.categoryMediaRepository.findOne({
            where: { id: mediaId, categoryId },
        });
        if (!media) {
            throw new common_1.NotFoundException(`Media with ID ${mediaId} not found in category ${categoryId}`);
        }
        try {
            await this.s3Service.deleteFile(media.url);
        }
        catch (error) {
            this.logger.error(`Failed to delete S3 object: ${media.url}`, error);
        }
        await this.categoryMediaRepository.remove(media);
    }
    async getMedia(categoryId) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
        }
        const media = await this.categoryMediaRepository.find({
            where: { categoryId },
            order: { createdAt: 'DESC' },
        });
        return Promise.all(media.map(async (m) => {
            const dto = this.toMediaDto(m);
            const signedUrl = await this.s3Service.getSignedUrl(m.url);
            return {
                ...dto,
                url: signedUrl,
                signedUrl: signedUrl,
            };
        }));
    }
    async exists(id) {
        const count = await this.categoryRepository.count({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        return count > 0;
    }
    async findOneWithDeleted(id) {
        return this.categoryRepository.findOne({
            where: { id },
            withDeleted: true,
            relations: ['media', 'autoReplyTemplates'],
        });
    }
    toCategoryDto(category) {
        const dto = (0, class_transformer_1.plainToInstance)(category_dto_1.CategoryDto, category, {
            excludeExtraneousValues: true,
        });
        if (category.media) {
            dto.media = category.media.map((m) => this.toMediaDto(m));
        }
        return dto;
    }
    toMediaDto(media) {
        return (0, class_transformer_1.plainToInstance)(category_dto_1.MediaDto, media, {
            excludeExtraneousValues: true,
        });
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = CategoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(category_media_entity_1.CategoryMedia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        services_1.S3Service])
], CategoryService);
//# sourceMappingURL=category.service.js.map