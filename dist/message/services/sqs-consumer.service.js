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
var SqsConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const entities_1 = require("../../entities");
const enums_1 = require("../../common/enums");
const auto_reply_service_1 = require("../../auto-reply/auto-reply.service");
const sla_service_1 = require("../../sla/sla.service");
const chat_gateway_1 = require("../gateways/chat.gateway");
const whatsapp_service_1 = require("../../common/services/whatsapp.service");
const category_detector_service_1 = require("./category-detector.service");
let SqsConsumerService = SqsConsumerService_1 = class SqsConsumerService {
    configService;
    leadRepository;
    messageRepository;
    categoryRepository;
    userRepository;
    userCategoryRepository;
    autoReplyService;
    slaService;
    chatGateway;
    whatsAppService;
    categoryDetectorService;
    logger = new common_1.Logger(SqsConsumerService_1.name);
    sqsClient;
    queueUrl;
    isPolling = false;
    pollInterval = null;
    constructor(configService, leadRepository, messageRepository, categoryRepository, userRepository, userCategoryRepository, autoReplyService, slaService, chatGateway, whatsAppService, categoryDetectorService) {
        this.configService = configService;
        this.leadRepository = leadRepository;
        this.messageRepository = messageRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.userCategoryRepository = userCategoryRepository;
        this.autoReplyService = autoReplyService;
        this.slaService = slaService;
        this.chatGateway = chatGateway;
        this.whatsAppService = whatsAppService;
        this.categoryDetectorService = categoryDetectorService;
        try {
            const region = this.configService.get('aws.region', 'us-east-1');
            const accessKeyId = this.configService.get('aws.accessKeyId');
            const secretAccessKey = this.configService.get('aws.secretAccessKey');
            this.sqsClient = new client_sqs_1.SQSClient({
                region,
                credentials: accessKeyId && secretAccessKey
                    ? { accessKeyId, secretAccessKey }
                    : undefined,
            });
            this.queueUrl = this.configService.get('aws.sqs.queueUrl', '');
        }
        catch (error) {
            throw error;
        }
    }
    async onModuleInit() {
        if (this.queueUrl) {
            this.startPolling();
        }
        else {
            this.logger.warn('SQS Queue URL not configured, polling disabled');
        }
    }
    onModuleDestroy() {
        this.stopPolling();
    }
    startPolling() {
        if (this.isPolling) {
            this.logger.warn('SQS polling already started');
            return;
        }
        this.isPolling = true;
        this.logger.log('Starting SQS message polling');
        this.poll();
    }
    stopPolling() {
        this.isPolling = false;
        if (this.pollInterval) {
            clearTimeout(this.pollInterval);
            this.pollInterval = null;
        }
        this.logger.log('Stopped SQS message polling');
    }
    async poll() {
        if (!this.isPolling)
            return;
        try {
            const command = new client_sqs_1.ReceiveMessageCommand({
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 5,
                VisibilityTimeout: 30,
            });
            const response = await this.sqsClient.send(command);
            if (response.Messages && response.Messages.length > 0) {
                for (const message of response.Messages) {
                    await this.processMessage(message);
                }
            }
        }
        catch (error) {
            this.logger.error('Error polling SQS:', error);
        }
        if (this.isPolling) {
            this.pollInterval = setTimeout(() => this.poll(), 1000);
        }
    }
    async processMessage(message) {
        try {
            if (!message.Body) {
                this.logger.warn('Received empty SQS message');
                if (message.ReceiptHandle) {
                    await this.deleteMessage(message.ReceiptHandle);
                }
                return;
            }
            const parsed = this.parseMessage(message.Body);
            if (!parsed) {
                this.logger.warn('Failed to parse SQS message');
                if (message.ReceiptHandle) {
                    await this.deleteMessage(message.ReceiptHandle);
                }
                return;
            }
            const recentCutoff = new Date(Date.now() - 60000);
            const existingLead = await this.leadRepository.findOne({
                where: { phoneNumber: parsed.phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (existingLead) {
                const duplicateMessage = await this.messageRepository
                    .createQueryBuilder('msg')
                    .where('msg.leadId = :leadId', { leadId: existingLead.id })
                    .andWhere('msg.content = :content', { content: parsed.content })
                    .andWhere('msg.direction = :direction', {
                    direction: enums_1.MessageDirection.INBOUND,
                })
                    .andWhere('msg.createdAt > :cutoff', { cutoff: recentCutoff })
                    .getOne();
                if (duplicateMessage) {
                    this.logger.log(`Duplicate message detected for ${parsed.phoneNumber}, skipping`);
                    if (message.ReceiptHandle) {
                        await this.deleteMessage(message.ReceiptHandle);
                    }
                    return;
                }
            }
            this.logger.log(`Processing inbound message from ${parsed.phoneNumber}, type: ${parsed.messageType || 'text'}`);
            if (parsed.messageType === 'list_reply' && parsed.listReplyId) {
                await this.handleCategorySelection(parsed);
            }
            else if (parsed.messageType === 'nfm_reply' && parsed.flowToken) {
                await this.handleFlowResponse(parsed);
            }
            else {
                await this.handleNewMessage(parsed);
            }
            if (message.ReceiptHandle) {
                await this.deleteMessage(message.ReceiptHandle);
            }
        }
        catch (error) {
            this.logger.error('Error processing SQS message:', error);
        }
    }
    async handleNewMessage(parsed) {
        let lead = await this.leadRepository.findOne({
            where: { phoneNumber: parsed.phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['category'],
        });
        if (lead) {
            const storedMessage = await this.storeInboundMessage(lead.id, parsed);
            this.chatGateway.notifyNewMessage(lead.id, storedMessage);
            await this.notifyEligibleUsers(lead, storedMessage);
            this.logger.log(`Message stored for existing lead ${lead.id}`);
            return;
        }
        const detectedCategory = await this.categoryDetectorService.detectCategory(parsed.content);
        if (detectedCategory) {
            this.logger.log(`Category detected: ${detectedCategory.name} for ${parsed.phoneNumber}`);
            lead = await this.createLead(parsed.phoneNumber, parsed.customerName, detectedCategory.id);
            const storedMessage = await this.storeInboundMessage(lead.id, parsed);
            this.chatGateway.notifyNewMessage(lead.id, storedMessage);
            await this.notifyEligibleUsers(lead, storedMessage);
            await this.whatsAppService.sendLeadGenerateFlow(parsed.phoneNumber, `${lead.id}~${detectedCategory.id}`);
            await this.logOutboundMessage(lead.id, 'Lead details form sent', true);
        }
        else {
            this.logger.log(`No category detected for ${parsed.phoneNumber}, sending selection list`);
            lead = await this.createLead(parsed.phoneNumber, parsed.customerName, undefined);
            const storedMessage = await this.storeInboundMessage(lead.id, parsed);
            this.chatGateway.notifyNewMessage(lead.id, storedMessage);
            await this.notifyEligibleUsers(lead, storedMessage);
            const categories = await this.categoryRepository.find({
                where: { isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
                select: ['id', 'name', 'description'],
            });
            if (categories.length > 0) {
                await this.whatsAppService.sendCategorySelectionList(parsed.phoneNumber, parsed.customerName || '', categories);
                await this.logOutboundMessage(lead.id, 'Category selection list sent', true);
            }
            else {
                this.logger.warn('No active categories available for selection');
            }
        }
        try {
            await this.slaService.initializeSlaTracking(lead.id);
        }
        catch (slaError) {
            this.logger.warn(`SLA tracking init failed for lead ${lead.id}: ${slaError.message}`);
        }
    }
    async handleCategorySelection(parsed) {
        const listReplyId = parsed.listReplyId || '';
        if (!listReplyId.startsWith('category_select~')) {
            this.logger.warn(`Unknown list reply ID: ${listReplyId}`);
            return;
        }
        const categoryId = listReplyId.replace('category_select~', '');
        const lead = await this.leadRepository.findOne({
            where: { phoneNumber: parsed.phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!lead) {
            this.logger.warn(`Lead not found for category selection: ${parsed.phoneNumber}`);
            return;
        }
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId, isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!category) {
            this.logger.warn(`Category not found: ${categoryId}`);
            return;
        }
        lead.categoryId = categoryId;
        await this.leadRepository.save(lead);
        this.logger.log(`Lead ${lead.id} updated with category: ${category.name}`);
        await this.storeInboundMessage(lead.id, {
            ...parsed,
            content: `Selected category: ${category.name}`,
        });
        await this.whatsAppService.sendLeadGenerateFlow(parsed.phoneNumber, `${lead.id}~${categoryId}`);
        await this.logOutboundMessage(lead.id, 'Lead details form sent', true);
    }
    async handleFlowResponse(parsed) {
        if (!parsed.flowToken || !parsed.flowData) {
            this.logger.warn('Flow response missing token or data');
            return;
        }
        const tokenParts = parsed.flowToken.split('~');
        let leadId;
        let categoryId;
        if (tokenParts[0] === 'lead_generate') {
            leadId = tokenParts[1];
        }
        else {
            leadId = tokenParts[0];
            categoryId = tokenParts[1];
        }
        if (!leadId) {
            this.logger.warn(`Invalid flow token: ${parsed.flowToken}`);
            return;
        }
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
            relations: ['category'],
        });
        if (!lead) {
            this.logger.warn(`Lead not found for flow response: ${leadId}`);
            return;
        }
        const flowData = parsed.flowData;
        if (flowData.name) {
            lead.name = flowData.name;
        }
        if (flowData.business_name) {
            lead.businessName = flowData.business_name;
        }
        if (flowData.email) {
            lead.email = flowData.email;
        }
        if (flowData.pincode) {
            lead.pincode = String(flowData.pincode);
        }
        if (categoryId && !lead.categoryId) {
            lead.categoryId = categoryId;
        }
        const assignedUserId = await this.findAvailableExecutive(lead.categoryId || categoryId);
        if (assignedUserId) {
            lead.assignedToId = assignedUserId;
            lead.claimedAt = new Date();
        }
        await this.leadRepository.save(lead);
        this.logger.log(`Lead ${leadId} updated from flow: name="${lead.name}", businessName="${lead.businessName || 'N/A'}", email="${lead.email || 'N/A'}", pincode="${lead.pincode || 'N/A'}", assigned to: ${assignedUserId || 'unassigned'}`);
        const detailsParts = [`Name: ${lead.name || 'N/A'}`];
        if (lead.businessName)
            detailsParts.push(`Business: ${lead.businessName}`);
        if (lead.email)
            detailsParts.push(`Email: ${lead.email}`);
        if (lead.pincode)
            detailsParts.push(`Pincode: ${lead.pincode}`);
        const responseContent = `Customer submitted details:\n${detailsParts.join('\n')}`;
        const flowMessage = this.messageRepository.create({
            leadId,
            direction: enums_1.MessageDirection.INBOUND,
            content: responseContent,
            status: enums_1.MessageStatus.DELIVERED,
            isAutoReply: false,
        });
        const savedFlowMessage = await this.messageRepository.save(flowMessage);
        this.chatGateway.notifyNewMessage(leadId, savedFlowMessage);
        await this.notifyEligibleUsers(lead, savedFlowMessage);
        const effectiveCategoryId = lead.categoryId || categoryId;
        if (effectiveCategoryId) {
            await this.autoReplyService.sendAutoReply(leadId, '');
        }
    }
    async createLead(phoneNumber, customerName, categoryId) {
        const lead = this.leadRepository.create({
            phoneNumber,
            name: customerName || `Customer ${phoneNumber.slice(-4)}`,
            status: enums_1.LeadStatus.NEW,
            categoryId: categoryId || null,
        });
        const savedLead = await this.leadRepository.save(lead);
        this.logger.log(`Created new lead ${savedLead.id} for ${phoneNumber}, category: ${categoryId || 'pending selection'}`);
        return savedLead;
    }
    async findAvailableExecutive(categoryId) {
        if (!categoryId) {
            this.logger.log('No category ID provided for executive assignment');
            return null;
        }
        const userCategories = await this.userCategoryRepository.find({
            where: { categoryId },
            relations: ['user'],
        });
        const activeExecutives = userCategories
            .filter((uc) => uc.user && uc.user.isActive && uc.user.role === 'customer_executive')
            .map((uc) => uc.user);
        if (activeExecutives.length === 0) {
            this.logger.log(`No active Customer Executives found for category ${categoryId}`);
            return null;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let minLeads = Infinity;
        let selectedExecutive = null;
        for (const exec of activeExecutives) {
            const leadCount = await this.leadRepository.count({
                where: {
                    assignedToId: exec.id,
                },
            });
            if (leadCount < minLeads) {
                minLeads = leadCount;
                selectedExecutive = exec;
            }
        }
        if (selectedExecutive) {
            this.logger.log(`Auto-assigning to ${selectedExecutive.name} (${selectedExecutive.id}) with ${minLeads} leads`);
            return selectedExecutive.id;
        }
        return activeExecutives[0].id;
    }
    async storeInboundMessage(leadId, parsed) {
        const message = this.messageRepository.create({
            leadId,
            direction: enums_1.MessageDirection.INBOUND,
            content: parsed.content,
            mediaUrl: parsed.mediaUrl,
            mediaType: parsed.mediaType,
            status: enums_1.MessageStatus.DELIVERED,
            isAutoReply: false,
        });
        const savedMessage = await this.messageRepository.save(message);
        this.logger.log(`Stored inbound message ${savedMessage.id} for lead ${leadId}`);
        return savedMessage;
    }
    async logOutboundMessage(leadId, content, isAutoReply) {
        const message = this.messageRepository.create({
            leadId,
            direction: enums_1.MessageDirection.OUTBOUND,
            content,
            status: enums_1.MessageStatus.SENT,
            isAutoReply,
        });
        return this.messageRepository.save(message);
    }
    parseMessage(body) {
        try {
            const payload = JSON.parse(body);
            if (!payload.from || !payload.timestamp || !payload.type) {
                this.logger.warn('Missing required fields in SQS message');
                return null;
            }
            let content = '';
            let mediaUrl;
            let mediaType;
            let messageType = payload.type;
            let interactiveType;
            let listReplyId;
            let listReplyTitle;
            let flowToken;
            let flowData;
            switch (payload.type) {
                case 'text':
                    content = payload.text?.body || '';
                    break;
                case 'image':
                    content = payload.image?.caption || '[Image]';
                    mediaUrl = payload.image?.id;
                    mediaType = 'image';
                    break;
                case 'video':
                    content = payload.video?.caption || '[Video]';
                    mediaUrl = payload.video?.id;
                    mediaType = 'video';
                    break;
                case 'document':
                    content =
                        payload.document?.caption ||
                            payload.document?.filename ||
                            '[Document]';
                    mediaUrl = payload.document?.id;
                    mediaType = 'document';
                    break;
                case 'interactive':
                    if (payload.interactive) {
                        interactiveType = payload.interactive.type;
                        if (payload.interactive.type === 'list_reply') {
                            messageType = 'list_reply';
                            listReplyId = payload.interactive.list_reply?.id;
                            listReplyTitle = payload.interactive.list_reply?.title;
                            content = `Selected: ${listReplyTitle || listReplyId}`;
                        }
                        else if (payload.interactive.type === 'button_reply') {
                            messageType = 'button_reply';
                            content = payload.interactive.button_reply?.title || '';
                        }
                        else if (payload.interactive.type === 'nfm_reply') {
                            messageType = 'nfm_reply';
                            content = payload.interactive.nfm_reply?.body || '';
                            if (payload.interactive.nfm_reply?.response_json) {
                                try {
                                    const responseData = JSON.parse(payload.interactive.nfm_reply.response_json);
                                    flowToken = responseData.flow_token;
                                    flowData = {
                                        name: responseData.name,
                                        buisness_name: responseData.buisness_name,
                                        business_name: responseData.business_name,
                                        pincode: responseData.pincode,
                                        first_name: responseData.first_name,
                                        last_name: responseData.last_name,
                                        email: responseData.email,
                                        terms_agreement: responseData.terms_agreement,
                                        offers_acceptance: responseData.offers_acceptance,
                                        selected_category_id: responseData.selected_category_id,
                                    };
                                }
                                catch (parseError) {
                                    this.logger.warn('Failed to parse nfm_reply response_json');
                                }
                            }
                        }
                    }
                    break;
                default:
                    content = `[${payload.type}]`;
            }
            const timestamp = new Date(parseInt(payload.timestamp, 10) * 1000);
            return {
                phoneNumber: this.normalizePhoneNumber(payload.from),
                content,
                timestamp,
                mediaUrl,
                mediaType,
                rawMessageId: payload.id,
                customerName: payload.customerName,
                messageType,
                interactiveType,
                listReplyId,
                listReplyTitle,
                flowToken,
                flowData,
            };
        }
        catch (error) {
            this.logger.error('Error parsing SQS message body:', error);
            return null;
        }
    }
    normalizePhoneNumber(phone) {
        let normalized = phone.replace(/[^\d+]/g, '');
        if (!normalized.startsWith('+')) {
            normalized = '+' + normalized;
        }
        return normalized;
    }
    async deleteMessage(receiptHandle) {
        try {
            const command = new client_sqs_1.DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: receiptHandle,
            });
            await this.sqsClient.send(command);
            this.logger.debug('Message deleted from SQS');
        }
        catch (error) {
            this.logger.error('Error deleting SQS message:', error);
        }
    }
    isActive() {
        return this.isPolling;
    }
    async notifyEligibleUsers(lead, message) {
        try {
            const users = await this.userRepository.find({
                where: { isActive: true, deletedAt: (0, typeorm_2.IsNull)() },
                relations: ['categories'],
            });
            const eligibleUserIds = [];
            for (const user of users) {
                let hasAccess = false;
                switch (user.role) {
                    case 'admin':
                        hasAccess = true;
                        break;
                    case 'manager':
                        const managerCategories = user.categories?.map((c) => c.id) || [];
                        hasAccess =
                            !lead.categoryId || managerCategories.includes(lead.categoryId);
                        break;
                    case 'customer_executive':
                        hasAccess = lead.assignedToId === user.id;
                        break;
                    default:
                        hasAccess = false;
                }
                if (hasAccess) {
                    eligibleUserIds.push(user.id);
                }
            }
            for (const userId of eligibleUserIds) {
                const notification = {
                    type: 'new_message',
                    leadId: lead.id,
                    leadName: lead.name || 'Unknown Contact',
                    phoneNumber: lead.phoneNumber,
                    message: message.content || 'Media message',
                    timestamp: new Date(),
                    messageId: message.id,
                };
                this.chatGateway.emitNotification(userId, notification);
                this.logger.log(`Sent notification to user ${userId} for lead ${lead.id}`);
            }
            this.logger.log(`Notified ${eligibleUserIds.length} eligible users about message from lead ${lead.id}`);
        }
        catch (error) {
            this.logger.error('Error notifying eligible users:', error);
        }
    }
};
exports.SqsConsumerService = SqsConsumerService;
exports.SqsConsumerService = SqsConsumerService = SqsConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Message)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.UserCategory)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        auto_reply_service_1.AutoReplyService,
        sla_service_1.SlaService,
        chat_gateway_1.ChatGateway,
        whatsapp_service_1.WhatsAppService,
        category_detector_service_1.CategoryDetectorService])
], SqsConsumerService);
//# sourceMappingURL=sqs-consumer.service.js.map