import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

// WhatsApp SDK instance
let WhatsAppSDK: any = null;

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private whatsapp: any = null;
  private isInitialized = false;

  constructor() {}

  async onModuleInit() {
    await this.initializeWhatsApp();
  }

  private async initializeWhatsApp(): Promise<void> {
    try {
      // Dynamically require whatsapp package if available
      if (!WhatsAppSDK) {
        WhatsAppSDK = require('whatsapp');
      }
      this.whatsapp = new WhatsAppSDK();
      this.isInitialized = true;
      this.logger.log('WhatsApp SDK initialized successfully');
    } catch (error) {
      this.logger.warn(
        'WhatsApp package not installed or failed to initialize',
      );
      this.isInitialized = false;
    }
  }

  private getWhatsAppInstance(): any | null {
    if (!this.isInitialized || !this.whatsapp) {
      this.logger.warn('WhatsApp not configured');
      return null;
    }
    return this.whatsapp;
  }

  /**
   * Send a text message to a WhatsApp number
   */
  async sendTextMessage(
    toMobileNo: number | string,
    textMsg: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send message');
      return false;
    }

    try {
      await whatsapp.messages.text(
        {
          body: textMsg,
        },
        toMobileNo,
      );
      this.logger.log(`Text message sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending text message:', errorMsg);
      return false;
    }
  }

  /**
   * Set typing indicator for a received message
   */
  async setTypingIndicator(receivedMessageId: string): Promise<boolean> {
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
      } as any);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending typing indicator:', errorMsg);
      return false;
    }
  }

  /**
   * Send a document via WhatsApp
   */
  async sendDocument(
    toMobileNo: number | string,
    documentUrl: string,
    caption?: string,
    filename?: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send document');
      return false;
    }

    try {
      await whatsapp.messages.document(
        {
          link: documentUrl,
          caption: caption || '',
          filename: filename || '',
        },
        toMobileNo,
      );
      this.logger.log(`Document sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending document:', errorMsg);
      return false;
    }
  }

  /**
   * Send an image via WhatsApp using direct S3 URL (link method)
   */
  async sendImage(
    toMobileNo: number | string,
    imageUrl: string,
    caption?: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send image');
      return false;
    }

    try {
      await whatsapp.messages.image(
        {
          link: imageUrl,
          caption: caption || '',
        },
        toMobileNo,
      );
      this.logger.log(`Image sent to ${toMobileNo} using link`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending image:', errorMsg);
      return false;
    }
  }

  /**
   * Send a video via WhatsApp using direct S3 URL (link method)
   */
  async sendVideo(
    toMobileNo: number | string,
    videoUrl: string,
    caption?: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send video');
      return false;
    }

    try {
      await whatsapp.messages.video(
        {
          link: videoUrl,
          caption: caption || '',
        },
        toMobileNo,
      );
      this.logger.log(`Video sent to ${toMobileNo} using link`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending video:', errorMsg);
      return false;
    }
  }

  /**
   * Send an interactive list message
   */
  async sendListMessage(
    toMobileNo: number | string,
    header: string,
    body: string,
    footer: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send list message');
      return false;
    }

    try {
      await whatsapp.messages.interactive(
        {
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
        } as any,
        toMobileNo,
      );
      this.logger.log(`List message sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending list message:', errorMsg);
      return false;
    }
  }

  /**
   * Send a CTA URL button message
   */
  async sendCtaUrlMessage(
    toMobileNo: number | string,
    header: string,
    body: string,
    displayText: string,
    url: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send CTA URL message');
      return false;
    }

    try {
      await whatsapp.messages.interactive(
        {
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
        } as any,
        toMobileNo,
      );
      this.logger.log(`CTA URL message sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending CTA URL message:', errorMsg);
      return false;
    }
  }

  /**
   * Send a flow message
   */
  async sendFlowMessage(
    toMobileNo: number | string,
    header: string,
    body: string,
    flowId: string,
    flowToken: string,
    ctaText: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn('WhatsApp not configured, cannot send flow message');
      return false;
    }

    try {
      await whatsapp.messages.interactive(
        {
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
        } as any,
        toMobileNo,
      );
      this.logger.log(`Flow message sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending flow message:', errorMsg);
      return false;
    }
  }

  /**
   * Send lead generation flow to collect customer details
   * Flow collects: first_name, last_name, email, terms_agreement, offers_acceptance
   */
  async sendLeadGenerateFlow(
    toMobileNo: number | string,
    leadId: string,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn(
        'WhatsApp not configured, cannot send lead generate flow',
      );
      return false;
    }

    try {
      await whatsapp.messages.interactive(
        {
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
        } as any,
        toMobileNo,
      );
      this.logger.log(`Lead generate flow sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending lead generate flow:', errorMsg);
      return false;
    }
  }

  /**
   * Send a carousel message with multiple media cards (images or videos)
   * Based on WhatsApp Interactive Media Carousel Messages API
   * Each card can have an image/video header, body text, and CTA button
   * Max 10 cards allowed, min 2 cards required
   */
  async sendCarouselMessage(
    toMobileNo: number | string,
    bodyText: string,
    cards: Array<{
      mediaUrl: string;
      mediaType: 'image' | 'video';
      bodyText: string;
      ctaDisplayText?: string;
      ctaUrl?: string;
    }>,
  ): Promise<boolean> {
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
          text: card.bodyText || ' ', // Body text is required
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

      const response = await whatsapp.messages.interactive(
        {
          type: 'carousel',
          body: {
            text: bodyText,
          },
          action: {
            cards: carouselCards,
          },
        } as any,
        phoneNumber,
      );

      if (response?.respStatusCode === 200) {
        this.logger.log(
          `Carousel message sent to ${phoneNumber} with ${cards.length} cards`,
        );
      } else {
        this.logger.log(
          `Carousel message sent to ${phoneNumber}, response: ${response?.respStatusCode || 'unknown'}`,
        );
      }

      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending carousel message:', errorMsg);
      return false;
    }
  }

  /**
   * Send category selection list when category cannot be detected
   * User selects a category from the list to proceed
   */
  async sendCategorySelectionList(
    toMobileNo: number | string,
    customerName: string,
    categories: Array<{ id: string; name: string; description?: string }>,
  ): Promise<boolean> {
    const whatsapp = this.getWhatsAppInstance();
    if (!whatsapp) {
      this.logger.warn(
        'WhatsApp not configured, cannot send category selection list',
      );
      return false;
    }

    try {
      const rows = categories.map((cat) => ({
        id: `category_select~${cat.id}`,
        title: cat.name.substring(0, 24), // WhatsApp limit: 24 chars
        description: cat.description?.substring(0, 72) || '', // WhatsApp limit: 72 chars
      }));

      await whatsapp.messages.interactive(
        {
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
        } as any,
        toMobileNo,
      );
      this.logger.log(`Category selection list sent to ${toMobileNo}`);
      return true;
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error sending category selection list:', errorMsg);
      return false;
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
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
    } catch (error: any) {
      const errorMsg = this.extractErrorMessage(error);
      this.logger.error('Error marking message as read:', errorMsg);
      return false;
    }
  }

  /**
   * Check if WhatsApp service is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.whatsapp !== null;
  }

  /**
   * Safely extract error message from error object
   * Handles circular references in axios/http errors
   */
  private extractErrorMessage(error: any): string {
    if (!error) return 'Unknown error';

    // Try to get response data first (most useful for API errors)
    if (error.response?.data) {
      try {
        if (typeof error.response.data === 'string') {
          return error.response.data;
        }
        return JSON.stringify(error.response.data);
      } catch {
        // If stringify fails, try to extract specific fields
        const data = error.response.data;
        if (data.error?.message) return data.error.message;
        if (data.message) return data.message;
      }
    }

    // Try error message
    if (error.message) return error.message;

    // Try to stringify the error itself
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
}
