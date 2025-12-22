import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Lead } from '../../entities';
import {
  MessageDirection,
  MessageStatus,
  LeadStatus,
} from '../../common/enums';
import { WhatsAppService } from '../../common/services/whatsapp.service';
import { S3Service } from '../../common/services/s3.service';
import { SendMessageDto, PaginationDto } from '../dto';

const MAX_RETRY_ATTEMPTS = 3;

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly whatsAppService: WhatsAppService,
    private readonly s3Service: S3Service,
  ) {}

  async getConversation(
    leadId: string,
    pagination: PaginationDto,
  ): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
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

    // Regenerate signed URLs for messages with media
    const data = await Promise.all(
      messages.map(async (msg) => {
        if (msg.mediaUrl && this.isS3Key(msg.mediaUrl)) {
          try {
            const signedUrl = await this.s3Service.getSignedUrl(msg.mediaUrl);
            return { ...msg, mediaUrl: signedUrl };
          } catch (error) {
            this.logger.warn(
              `Failed to generate signed URL for message ${msg.id}`,
            );
            return msg;
          }
        }
        return msg;
      }),
    );

    return { data: data as Message[], total, page, limit };
  }

  /**
   * Check if a URL is an S3 key (not a full URL)
   */
  private isS3Key(url: string): boolean {
    // S3 keys don't start with http:// or https://
    return !url.startsWith('http://') && !url.startsWith('https://');
  }

  async send(
    leadId: string,
    dto: SendMessageDto,
    senderId: string,
  ): Promise<Message> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    // Create message record
    const message = this.messageRepository.create({
      leadId,
      direction: MessageDirection.OUTBOUND,
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType,
      sentById: senderId,
      status: MessageStatus.PENDING,
      isAutoReply: false,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Send via WhatsApp with retry logic
    const sent = await this.sendWithRetry(lead.phoneNumber, dto);

    // Update message status
    savedMessage.status = sent ? MessageStatus.SENT : MessageStatus.FAILED;
    await this.messageRepository.save(savedMessage);

    // Update lead status to CONTACTED if it's NEW (first manual response)
    if (lead.status === LeadStatus.NEW && sent) {
      lead.status = LeadStatus.CONTACTED;
      await this.leadRepository.save(lead);
      this.logger.log(`Lead ${leadId} status updated to CONTACTED`);
    }

    this.logger.log(
      `Message ${savedMessage.id} sent to lead ${leadId}, status: ${savedMessage.status}`,
    );

    return savedMessage;
  }

  private async sendWithRetry(
    phoneNumber: string,
    dto: SendMessageDto,
  ): Promise<boolean> {
    let attempts = 0;
    let success = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !success) {
      attempts++;

      try {
        if (dto.mediaUrl && dto.mediaType) {
          // Send media message
          switch (dto.mediaType) {
            case 'image':
              success = await this.whatsAppService.sendImage(
                phoneNumber,
                dto.mediaUrl,
                dto.content,
              );
              break;
            case 'video':
              success = await this.whatsAppService.sendVideo(
                phoneNumber,
                dto.mediaUrl,
                dto.content,
              );
              break;
            case 'document':
              success = await this.whatsAppService.sendDocument(
                phoneNumber,
                dto.mediaUrl,
                dto.content,
              );
              break;
            default:
              success = await this.whatsAppService.sendTextMessage(
                phoneNumber,
                dto.content,
              );
          }
        } else {
          // Send text message
          success = await this.whatsAppService.sendTextMessage(
            phoneNumber,
            dto.content,
          );
        }

        if (success) {
          this.logger.log(
            `Message sent successfully to ${phoneNumber} on attempt ${attempts}`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Failed to send message to ${phoneNumber}, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}`,
        );
      }

      if (!success && attempts < MAX_RETRY_ATTEMPTS) {
        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempts) * 1000);
      }
    }

    if (!success) {
      this.logger.error(
        `Failed to send message to ${phoneNumber} after ${MAX_RETRY_ATTEMPTS} attempts`,
      );
    }

    return success;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async storeIncomingMessage(
    leadId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      leadId,
      direction: MessageDirection.INBOUND,
      content,
      mediaUrl,
      mediaType: mediaType as any,
      status: MessageStatus.DELIVERED,
      isAutoReply: false,
    });

    return this.messageRepository.save(message);
  }

  async findById(id: string): Promise<Message | null> {
    return this.messageRepository.findOne({
      where: { id },
      relations: ['lead', 'sentBy'],
    });
  }

  async getMessagesByLead(leadId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { leadId },
      order: { createdAt: 'ASC' },
    });
  }
}
