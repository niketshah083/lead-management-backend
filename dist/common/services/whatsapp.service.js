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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
let WhatsAppSDK = null;
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    logger = new common_1.Logger(WhatsAppService_1.name);
    whatsapp = null;
    isInitialized = false;
    constructor() { }
    async onModuleInit() {
        await this.initializeWhatsApp();
    }
    async initializeWhatsApp() {
        try {
            if (!WhatsAppSDK) {
                WhatsAppSDK = require('whatsapp');
            }
            this.whatsapp = new WhatsAppSDK();
            this.isInitialized = true;
            this.logger.log('WhatsApp SDK initialized successfully');
        }
        catch (error) {
            this.logger.warn('WhatsApp package not installed or failed to initialize');
            this.isInitialized = false;
        }
    }
    getWhatsAppInstance() {
        if (!this.isInitialized || !this.whatsapp) {
            this.logger.warn('WhatsApp not configured');
            return null;
        }
        return this.whatsapp;
    }
    async sendTextMessage(toMobileNo, textMsg) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send message');
            return false;
        }
        try {
            await whatsapp.messages.text({
                body: textMsg,
            }, toMobileNo);
            this.logger.log(`Text message sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending text message:', errorMsg);
            return false;
        }
    }
    async setTypingIndicator(receivedMessageId) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot set typing indicator');
            return false;
        }
        try {
            await whatsapp.messages.status({
                status: 'read',
                message_id: receivedMessageId,
                typing_indicator: {
                    type: 'text',
                },
            });
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending typing indicator:', errorMsg);
            return false;
        }
    }
    async sendDocument(toMobileNo, documentUrl, caption, filename) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send document');
            return false;
        }
        try {
            await whatsapp.messages.document({
                link: documentUrl,
                caption: caption || '',
                filename: filename || '',
            }, toMobileNo);
            this.logger.log(`Document sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending document:', errorMsg);
            return false;
        }
    }
    async sendImage(toMobileNo, imageUrl, caption) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send image');
            return false;
        }
        try {
            await whatsapp.messages.image({
                link: imageUrl,
                caption: caption || '',
            }, toMobileNo);
            this.logger.log(`Image sent to ${toMobileNo} using link`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending image:', errorMsg);
            return false;
        }
    }
    async sendVideo(toMobileNo, videoUrl, caption) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send video');
            return false;
        }
        try {
            await whatsapp.messages.video({
                link: videoUrl,
                caption: caption || '',
            }, toMobileNo);
            this.logger.log(`Video sent to ${toMobileNo} using link`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending video:', errorMsg);
            return false;
        }
    }
    async sendListMessage(toMobileNo, header, body, footer, buttonText, sections) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send list message');
            return false;
        }
        try {
            await whatsapp.messages.interactive({
                type: 'list',
                header: {
                    type: 'text',
                    text: header,
                },
                body: {
                    text: body,
                },
                footer: {
                    text: footer,
                },
                action: {
                    button: buttonText,
                    sections,
                },
            }, toMobileNo);
            this.logger.log(`List message sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending list message:', errorMsg);
            return false;
        }
    }
    async sendCtaUrlMessage(toMobileNo, header, body, displayText, url) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send CTA URL message');
            return false;
        }
        try {
            await whatsapp.messages.interactive({
                type: 'cta_url',
                header: {
                    type: 'text',
                    text: header,
                },
                body: {
                    text: body,
                },
                action: {
                    name: 'cta_url',
                    parameters: {
                        display_text: displayText,
                        url: url,
                    },
                },
            }, toMobileNo);
            this.logger.log(`CTA URL message sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending CTA URL message:', errorMsg);
            return false;
        }
    }
    async sendFlowMessage(toMobileNo, header, body, flowId, flowToken, ctaText) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send flow message');
            return false;
        }
        try {
            await whatsapp.messages.interactive({
                type: 'flow',
                header: {
                    type: 'text',
                    text: header,
                },
                body: {
                    text: body,
                },
                action: {
                    name: 'flow',
                    parameters: {
                        flow_message_version: '3',
                        flow_action: 'data_exchange',
                        flow_token: flowToken,
                        flow_id: flowId,
                        flow_cta: ctaText,
                    },
                },
            }, toMobileNo);
            this.logger.log(`Flow message sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending flow message:', errorMsg);
            return false;
        }
    }
    async sendLeadGenerateFlow(toMobileNo, leadId) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send lead generate flow');
            return false;
        }
        try {
            await whatsapp.messages.interactive({
                type: 'flow',
                header: {
                    type: 'text',
                    text: 'Enter Details',
                },
                body: {
                    text: 'Please enter your details to help us serve you better!',
                },
                action: {
                    name: 'flow',
                    parameters: {
                        flow_message_version: '3',
                        flow_action: 'navigate',
                        flow_token: `lead_generate~${leadId}`,
                        flow_id: '1165135069021636',
                        flow_cta: 'Enter Details',
                    },
                },
            }, toMobileNo);
            this.logger.log(`Lead generate flow sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending lead generate flow:', errorMsg);
            return false;
        }
    }
    async sendCarouselMessage(toMobileNo, bodyText, cards) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send carousel message');
            return false;
        }
        if (cards.length < 2) {
            this.logger.warn('Carousel requires at least 2 cards');
            return false;
        }
        try {
            const carouselCards = cards.slice(0, 10).map((card, index) => ({
                card_index: index,
                type: 'cta_url',
                header: {
                    type: card.mediaType,
                    [card.mediaType]: {
                        link: card.mediaUrl,
                    },
                },
                body: {
                    text: card.bodyText || ' ',
                },
                action: {
                    name: 'cta_url',
                    parameters: {
                        display_text: card.ctaDisplayText || 'View',
                        url: card.ctaUrl || 'https://mehtaindia.com',
                    },
                },
            }));
            const phoneNumber = String(toMobileNo).replace(/[^0-9]/g, '');
            const response = await whatsapp.messages.interactive({
                type: 'carousel',
                body: {
                    text: bodyText,
                },
                action: {
                    cards: carouselCards,
                },
            }, phoneNumber);
            if (response?.respStatusCode === 200) {
                this.logger.log(`Carousel message sent to ${phoneNumber} with ${cards.length} cards`);
            }
            else {
                this.logger.log(`Carousel message sent to ${phoneNumber}, response: ${response?.respStatusCode || 'unknown'}`);
            }
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending carousel message:', errorMsg);
            return false;
        }
    }
    async sendCategorySelectionList(toMobileNo, customerName, categories) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot send category selection list');
            return false;
        }
        try {
            const rows = categories.map((cat) => ({
                id: `category_select~${cat.id}`,
                title: cat.name.substring(0, 24),
                description: cat.description?.substring(0, 72) || '',
            }));
            await whatsapp.messages.interactive({
                type: 'list',
                header: {
                    type: 'text',
                    text: `Welcome ${customerName || 'there'}!`,
                },
                body: {
                    text: 'Please select a category that best describes what you are looking for:',
                },
                footer: {
                    text: 'Select an option to continue',
                },
                action: {
                    button: 'Choose Category',
                    sections: [
                        {
                            title: 'Categories',
                            rows: rows,
                        },
                    ],
                },
            }, toMobileNo);
            this.logger.log(`Category selection list sent to ${toMobileNo}`);
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error sending category selection list:', errorMsg);
            return false;
        }
    }
    async markAsRead(messageId) {
        const whatsapp = this.getWhatsAppInstance();
        if (!whatsapp) {
            this.logger.warn('WhatsApp not configured, cannot mark message as read');
            return false;
        }
        try {
            await whatsapp.messages.status({
                status: 'read',
                message_id: messageId,
            });
            return true;
        }
        catch (error) {
            const errorMsg = this.extractErrorMessage(error);
            this.logger.error('Error marking message as read:', errorMsg);
            return false;
        }
    }
    isAvailable() {
        return this.isInitialized && this.whatsapp !== null;
    }
    extractErrorMessage(error) {
        if (!error)
            return 'Unknown error';
        if (error.response?.data) {
            try {
                if (typeof error.response.data === 'string') {
                    return error.response.data;
                }
                return JSON.stringify(error.response.data);
            }
            catch {
                const data = error.response.data;
                if (data.error?.message)
                    return data.error.message;
                if (data.message)
                    return data.message;
            }
        }
        if (error.message)
            return error.message;
        try {
            return JSON.stringify(error);
        }
        catch {
            return String(error);
        }
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map