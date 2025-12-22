import { OnModuleInit } from '@nestjs/common';
export declare class WhatsAppService implements OnModuleInit {
    private readonly logger;
    private whatsapp;
    private isInitialized;
    constructor();
    onModuleInit(): Promise<void>;
    private initializeWhatsApp;
    private getWhatsAppInstance;
    sendTextMessage(toMobileNo: number | string, textMsg: string): Promise<boolean>;
    setTypingIndicator(receivedMessageId: string): Promise<boolean>;
    sendDocument(toMobileNo: number | string, documentUrl: string, caption?: string, filename?: string): Promise<boolean>;
    sendImage(toMobileNo: number | string, imageUrl: string, caption?: string): Promise<boolean>;
    sendVideo(toMobileNo: number | string, videoUrl: string, caption?: string): Promise<boolean>;
    sendListMessage(toMobileNo: number | string, header: string, body: string, footer: string, buttonText: string, sections: Array<{
        title: string;
        rows: Array<{
            id: string;
            title: string;
            description?: string;
        }>;
    }>): Promise<boolean>;
    sendCtaUrlMessage(toMobileNo: number | string, header: string, body: string, displayText: string, url: string): Promise<boolean>;
    sendFlowMessage(toMobileNo: number | string, header: string, body: string, flowId: string, flowToken: string, ctaText: string): Promise<boolean>;
    sendLeadGenerateFlow(toMobileNo: number | string, leadId: string): Promise<boolean>;
    sendCarouselMessage(toMobileNo: number | string, bodyText: string, cards: Array<{
        mediaUrl: string;
        mediaType: 'image' | 'video';
        bodyText: string;
        ctaDisplayText?: string;
        ctaUrl?: string;
    }>): Promise<boolean>;
    sendCategorySelectionList(toMobileNo: number | string, customerName: string, categories: Array<{
        id: string;
        name: string;
        description?: string;
    }>): Promise<boolean>;
    markAsRead(messageId: string): Promise<boolean>;
    isAvailable(): boolean;
    private extractErrorMessage;
}
