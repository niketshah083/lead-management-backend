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
var MessageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
const enums_1 = require("../../common/enums");
const whatsapp_service_1 = require("../../common/services/whatsapp.service");
const s3_service_1 = require("../../common/services/s3.service");
const MAX_RETRY_ATTEMPTS = 3;
let MessageService = MessageService_1 = class MessageService {
    messageRepository;
    leadRepository;
    whatsAppService;
    s3Service;
    logger = new common_1.Logger(MessageService_1.name);
    constructor(messageRepository, leadRepository, whatsAppService, s3Service) {
        this.messageRepository = messageRepository;
        this.leadRepository = leadRepository;
        this.whatsAppService = whatsAppService;
        this.s3Service = s3Service;
    }
    async getConversation(leadId, pagination) {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${leadId} not found`);
        }
        const page = pagination.page || 1;
        const limit = pagination.limit || 50;
        const skip = (page - 1) * limit;
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { leadId },
            relations: ['sentBy'],
            order: { createdAt: 'ASC' },
            skip,
            take: limit,
        });
        const data = await Promise.all(messages.map(async (msg) => {
            if (msg.mediaUrl && this.isS3Key(msg.mediaUrl)) {
                try {
                    const signedUrl = await this.s3Service.getSignedUrl(msg.mediaUrl);
                    return { ...msg, mediaUrl: signedUrl };
                }
                catch (error) {
                    this.logger.warn(`Failed to generate signed URL for message ${msg.id}`);
                    return msg;
                }
            }
            return msg;
        }));
        return { data: data, total, page, limit };
    }
    isS3Key(url) {
        return !url.startsWith('http://') && !url.startsWith('https://');
    }
    async send(leadId, dto, senderId) {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
        });
        if (!lead) {
            throw new common_1.NotFoundException(`Lead with ID ${leadId} not found`);
        }
        const message = this.messageRepository.create({
            leadId,
            direction: enums_1.MessageDirection.OUTBOUND,
            content: dto.content,
            mediaUrl: dto.mediaUrl,
            mediaType: dto.mediaType,
            sentById: senderId,
            status: enums_1.MessageStatus.PENDING,
            isAutoReply: false,
        });
        const savedMessage = await this.messageRepository.save(message);
        const sent = await this.sendWithRetry(lead.phoneNumber, dto);
        savedMessage.status = sent ? enums_1.MessageStatus.SENT : enums_1.MessageStatus.FAILED;
        await this.messageRepository.save(savedMessage);
        if (lead.status === enums_1.LeadStatus.NEW && sent) {
            lead.status = enums_1.LeadStatus.CONTACTED;
            await this.leadRepository.save(lead);
            this.logger.log(`Lead ${leadId} status updated to CONTACTED`);
        }
        this.logger.log(`Message ${savedMessage.id} sent to lead ${leadId}, status: ${savedMessage.status}`);
        return savedMessage;
    }
    async sendWithRetry(phoneNumber, dto) {
        let attempts = 0;
        let success = false;
        while (attempts < MAX_RETRY_ATTEMPTS && !success) {
            attempts++;
            try {
                if (dto.mediaUrl && dto.mediaType) {
                    switch (dto.mediaType) {
                        case 'image':
                            success = await this.whatsAppService.sendImage(phoneNumber, dto.mediaUrl, dto.content);
                            break;
                        case 'video':
                            success = await this.whatsAppService.sendVideo(phoneNumber, dto.mediaUrl, dto.content);
                            break;
                        case 'document':
                            success = await this.whatsAppService.sendDocument(phoneNumber, dto.mediaUrl, dto.content);
                            break;
                        default:
                            success = await this.whatsAppService.sendTextMessage(phoneNumber, dto.content);
                    }
                }
                else {
                    success = await this.whatsAppService.sendTextMessage(phoneNumber, dto.content);
                }
                if (success) {
                    this.logger.log(`Message sent successfully to ${phoneNumber} on attempt ${attempts}`);
                }
            }
            catch (error) {
                this.logger.warn(`Failed to send message to ${phoneNumber}, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}`);
            }
            if (!success && attempts < MAX_RETRY_ATTEMPTS) {
                await this.delay(Math.pow(2, attempts) * 1000);
            }
        }
        if (!success) {
            this.logger.error(`Failed to send message to ${phoneNumber} after ${MAX_RETRY_ATTEMPTS} attempts`);
        }
        return success;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async storeIncomingMessage(leadId, content, mediaUrl, mediaType) {
        const message = this.messageRepository.create({
            leadId,
            direction: enums_1.MessageDirection.INBOUND,
            content,
            mediaUrl,
            mediaType: mediaType,
            status: enums_1.MessageStatus.DELIVERED,
            isAutoReply: false,
        });
        return this.messageRepository.save(message);
    }
    async findById(id) {
        return this.messageRepository.findOne({
            where: { id },
            relations: ['lead', 'sentBy'],
        });
    }
    async getMessagesByLead(leadId) {
        return this.messageRepository.find({
            where: { leadId },
            order: { createdAt: 'ASC' },
        });
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = MessageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        whatsapp_service_1.WhatsAppService,
        s3_service_1.S3Service])
], MessageService);
//# sourceMappingURL=message.service.js.map