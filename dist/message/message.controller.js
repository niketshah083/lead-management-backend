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
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const services_1 = require("./services");
const dto_1 = require("./dto");
const services_2 = require("../common/services");
const enums_1 = require("../common/enums");
const chat_gateway_1 = require("./gateways/chat.gateway");
let MessageController = class MessageController {
    messageService;
    s3Service;
    chatGateway;
    constructor(messageService, s3Service, chatGateway) {
        this.messageService = messageService;
        this.s3Service = s3Service;
        this.chatGateway = chatGateway;
    }
    getConversation(leadId, pagination) {
        return this.messageService.getConversation(leadId, pagination);
    }
    send(leadId, dto, req) {
        return this.messageService.send(leadId, dto, req.user.id);
    }
    findOne(id) {
        return this.messageService.findById(id);
    }
    async testNotification(leadId) {
        const testMessage = {
            id: 'test-' + Date.now(),
            leadId,
            direction: enums_1.MessageDirection.INBOUND,
            content: 'Test notification message from backend',
            status: enums_1.MessageStatus.DELIVERED,
            isAutoReply: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.chatGateway.notifyNewMessage(leadId, testMessage);
        return { message: 'Test notification sent', leadId, testMessage };
    }
    async uploadMedia(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        let mediaType;
        if (file.mimetype.startsWith('image/')) {
            mediaType = enums_1.MediaType.IMAGE;
        }
        else if (file.mimetype.startsWith('video/')) {
            mediaType = enums_1.MediaType.VIDEO;
        }
        else if (file.mimetype === 'application/pdf') {
            mediaType = enums_1.MediaType.DOCUMENT;
        }
        else {
            throw new common_1.BadRequestException('Invalid file type. Allowed: images, videos, PDF documents');
        }
        const folder = 'chat-media';
        const uploadResult = await this.s3Service.uploadFile(file, folder);
        return {
            url: uploadResult.signedUrl,
            key: uploadResult.key,
            mediaType,
            filename: file.originalname,
            size: file.size,
        };
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, common_1.Get)('lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('lead/:leadId'),
    __param(0, (0, common_1.Param)('leadId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "send", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessageController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('test-notification/:leadId'),
    __param(0, (0, common_1.Param)('leadId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "testNotification", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 100 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "uploadMedia", null);
exports.MessageController = MessageController = __decorate([
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [services_1.MessageService,
        services_2.S3Service,
        chat_gateway_1.ChatGateway])
], MessageController);
//# sourceMappingURL=message.controller.js.map