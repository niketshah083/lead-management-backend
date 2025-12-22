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
var CategoryDetectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryDetectorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
let CategoryDetectorService = CategoryDetectorService_1 = class CategoryDetectorService {
    categoryRepository;
    logger = new common_1.Logger(CategoryDetectorService_1.name);
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async detectCategory(messageContent) {
        const matches = await this.findMatchingCategories(messageContent);
        if (matches.length === 0) {
            this.logger.debug('No category match found for message');
            return null;
        }
        const bestMatch = matches[0];
        this.logger.debug(`Best category match: ${bestMatch.category.name} with score ${bestMatch.score}`);
        return bestMatch.category;
    }
    async findMatchingCategories(messageContent) {
        const categories = await this.categoryRepository.find({
            where: {
                isActive: true,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
        const matches = [];
        const normalizedContent = this.normalizeText(messageContent);
        for (const category of categories) {
            const result = this.matchKeywords(normalizedContent, category.keywords);
            if (result.score > 0) {
                matches.push({
                    category,
                    score: result.score,
                    matchedKeywords: result.matchedKeywords,
                });
            }
        }
        matches.sort((a, b) => b.score - a.score);
        return matches;
    }
    matchKeywords(content, keywords) {
        if (!keywords || keywords.length === 0) {
            return { score: 0, matchedKeywords: [] };
        }
        const matchedKeywords = [];
        let score = 0;
        for (const keyword of keywords) {
            const normalizedKeyword = this.normalizeText(keyword);
            if (!normalizedKeyword)
                continue;
            const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegex(normalizedKeyword)}\\b`, 'i');
            if (wordBoundaryRegex.test(content)) {
                score += 2;
                matchedKeywords.push(keyword);
                continue;
            }
            if (content.includes(normalizedKeyword)) {
                score += 1;
                matchedKeywords.push(keyword);
            }
        }
        return { score, matchedKeywords };
    }
    normalizeText(text) {
        if (!text)
            return '';
        return text.toLowerCase().trim().replace(/\s+/g, ' ');
    }
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    async getDefaultCategory() {
        const defaultCategory = await this.categoryRepository.findOne({
            where: {
                isActive: true,
                deletedAt: (0, typeorm_2.IsNull)(),
            },
            order: {
                createdAt: 'ASC',
            },
        });
        return defaultCategory;
    }
};
exports.CategoryDetectorService = CategoryDetectorService;
exports.CategoryDetectorService = CategoryDetectorService = CategoryDetectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryDetectorService);
//# sourceMappingURL=category-detector.service.js.map