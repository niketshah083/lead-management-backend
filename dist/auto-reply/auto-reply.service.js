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
var AutoReplyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoReplyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
const whatsapp_service_1 = require("../common/services/whatsapp.service");
const s3_service_1 = require("../common/services/s3.service");
let AutoReplyService = AutoReplyService_1 = class AutoReplyService {
    templateRepository;
    categoryRepository;
    messageRepository;
    leadRepository;
    categoryMediaRepository;
    whatsAppService;
    s3Service;
    logger = new common_1.Logger(AutoReplyService_1.name);
    constructor(templateRepository, categoryRepository, messageRepository, leadRepository, categoryMediaRepository, whatsAppService, s3Service) {
        this.templateRepository = templateRepository;
        this.categoryRepository = categoryRepository;
        this.messageRepository = messageRepository;
        this.leadRepository = leadRepository;
        this.categoryMediaRepository = categoryMediaRepository;
        this.whatsAppService = whatsAppService;
        this.s3Service = s3Service;
    }
    async create(dto) {
        const category = await this.categoryRepository.findOne({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${dto.categoryId} not found`);
        }
        const template = this.templateRepository.create({
            categoryId: dto.categoryId,
            triggerKeyword: dto.triggerKeyword,
            messageContent: dto.messageContent,
            priority: dto.priority ?? 0,
            isActive: dto.isActive ?? true,
        });
        const savedTemplate = await this.templateRepository.save(template);
        this.logger.log(`Created auto-reply template ${savedTemplate.id}`);
        return savedTemplate;
    }
    async findAll(categoryId) {
        const query = this.templateRepository
            .createQueryBuilder('template')
            .leftJoinAndSelect('template.category', 'category')
            .orderBy('template.priority', 'DESC');
        if (categoryId) {
            query.where('template.categoryId = :categoryId', { categoryId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const template = await this.templateRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!template) {
            throw new common_1.NotFoundException(`Auto-reply template with ID ${id} not found`);
        }
        return template;
    }
    async update(id, dto) {
        const template = await this.findOne(id);
        Object.assign(template, dto);
        const savedTemplate = await this.templateRepository.save(template);
        this.logger.log(`Updated auto-reply template ${id}`);
        return savedTemplate;
    }
    async remove(id) {
        const template = await this.findOne(id);
        await this.templateRepository.remove(template);
        this.logger.log(`Deleted auto-reply template ${id}`);
    }
    async selectTemplate(categoryId, messageContent) {
        const templates = await this.templateRepository.find({
            where: { categoryId, isActive: true },
            order: { priority: 'DESC' },
        });
        if (templates.length === 0) {
            return null;
        }
        const lowerContent = messageContent.toLowerCase();
        const matchingTemplates = templates.filter((template) => lowerContent.includes(template.triggerKeyword.toLowerCase()));
        if (matchingTemplates.length > 0) {
            return matchingTemplates[0];
        }
        return templates[0];
    }
    async sendAutoReply(leadId, messageContent) {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
            relations: ['category'],
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${leadId} not found`);
        }
        if (!lead.categoryId) {
            this.logger.log(`Lead ${leadId} has no category, skipping auto-reply`);
            return null;
        }
        const template = await this.selectTemplate(lead.categoryId, messageContent);
        let categoryMediaList = [];
        categoryMediaList = await this.categoryMediaRepository.find({
            where: { categoryId: lead.categoryId },
            order: { createdAt: 'ASC' },
        });
        let savedMessage = null;
        if (template) {
            const textSent = await this.whatsAppService.sendTextMessage(lead.phoneNumber, template.messageContent);
            const textMessage = this.messageRepository.create({
                leadId,
                direction: enums_1.MessageDirection.OUTBOUND,
                content: template.messageContent,
                status: textSent ? enums_1.MessageStatus.SENT : enums_1.MessageStatus.FAILED,
                isAutoReply: true,
            });
            savedMessage = await this.messageRepository.save(textMessage);
            this.logger.log(`Auto-reply text sent for lead ${leadId}, message ${savedMessage.id}, status: ${savedMessage.status}`);
        }
        if (categoryMediaList.length > 0) {
            for (const media of categoryMediaList) {
                await this.sendIndividualMedia(leadId, lead.phoneNumber, media);
            }
            this.logger.log(`Auto-reply sent ${categoryMediaList.length} media files for lead ${leadId}`);
        }
        return savedMessage;
    }
    async sendCategoryMedia(leadId) {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
            relations: ['category'],
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${leadId} not found`);
        }
        if (!lead.categoryId) {
            this.logger.log(`Lead ${leadId} has no category, skipping media send`);
            return;
        }
        const categoryMediaList = await this.categoryMediaRepository.find({
            where: { categoryId: lead.categoryId },
            order: { createdAt: 'ASC' },
        });
        if (categoryMediaList.length === 0) {
            this.logger.log(`No media found for category ${lead.categoryId}`);
            return;
        }
        for (const media of categoryMediaList) {
            await this.sendIndividualMedia(leadId, lead.phoneNumber, media);
        }
        this.logger.log(`Sent ${categoryMediaList.length} media files for lead ${leadId}`);
    }
    async sendIndividualMedia(leadId, phoneNumber, media) {
        try {
            const signedUrl = await this.s3Service.getSignedUrl(media.url);
            let sent = false;
            if (media.type === enums_1.MediaType.IMAGE) {
                sent = await this.whatsAppService.sendImage(phoneNumber, signedUrl);
            }
            else if (media.type === enums_1.MediaType.DOCUMENT) {
                sent = await this.whatsAppService.sendDocument(phoneNumber, signedUrl, media.filename);
            }
            else if (media.type === enums_1.MediaType.VIDEO) {
                sent = await this.whatsAppService.sendVideo(phoneNumber, signedUrl);
            }
            const mediaMessage = this.messageRepository.create({
                leadId,
                direction: enums_1.MessageDirection.OUTBOUND,
                content: media.filename || media.type,
                mediaUrl: media.url,
                mediaType: media.type,
                status: sent ? enums_1.MessageStatus.SENT : enums_1.MessageStatus.FAILED,
                isAutoReply: true,
            });
            await this.messageRepository.save(mediaMessage);
            this.logger.log(`Auto-reply media (${media.type}) sent for lead ${leadId}, status: ${sent ? 'SENT' : 'FAILED'}`);
        }
        catch (error) {
            this.logger.error(`Error sending individual media for lead ${leadId}:`, error);
        }
    }
};
exports.AutoReplyService = AutoReplyService;
exports.AutoReplyService = AutoReplyService = AutoReplyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.AutoReplyTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.CategoryMedia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsAppService,
        s3_service_1.S3Service])
], AutoReplyService);
//# sourceMappingURL=auto-reply.service.js.map