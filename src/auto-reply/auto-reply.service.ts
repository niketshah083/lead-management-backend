import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AutoReplyTemplate,
  Category,
  Lead,
  Message,
  CategoryMedia,
} from '../entities';
import { MessageDirection, MessageStatus, MediaType } from '../common/enums';
import { WhatsAppService } from '../common/services/whatsapp.service';
import { S3Service } from '../common/services/s3.service';
import { CreateAutoReplyTemplateDto, UpdateAutoReplyTemplateDto } from './dto';

@Injectable()
export class AutoReplyService {
  private readonly logger = new Logger(AutoReplyService.name);

  constructor(
    @InjectRepository(AutoReplyTemplate)
    private readonly templateRepository: Repository<AutoReplyTemplate>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(CategoryMedia)
    private readonly categoryMediaRepository: Repository<CategoryMedia>,
    private readonly whatsAppService: WhatsAppService,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: CreateAutoReplyTemplateDto): Promise<AutoReplyTemplate> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found`,
      );
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

  async findAll(categoryId?: string): Promise<AutoReplyTemplate[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.category', 'category')
      .orderBy('template.priority', 'DESC');

    if (categoryId) {
      query.where('template.categoryId = :categoryId', { categoryId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<AutoReplyTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!template) {
      throw new NotFoundException(
        `Auto-reply template with ID ${id} not found`,
      );
    }

    return template;
  }

  async update(
    id: string,
    dto: UpdateAutoReplyTemplateDto,
  ): Promise<AutoReplyTemplate> {
    const template = await this.findOne(id);

    Object.assign(template, dto);
    const savedTemplate = await this.templateRepository.save(template);
    this.logger.log(`Updated auto-reply template ${id}`);
    return savedTemplate;
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
    this.logger.log(`Deleted auto-reply template ${id}`);
  }

  /**
   * Select the best matching auto-reply template based on priority
   * Higher priority templates are selected first
   */
  async selectTemplate(
    categoryId: string,
    messageContent: string,
  ): Promise<AutoReplyTemplate | null> {
    const templates = await this.templateRepository.find({
      where: { categoryId, isActive: true },
      order: { priority: 'DESC' },
    });

    if (templates.length === 0) {
      return null;
    }

    const lowerContent = messageContent.toLowerCase();

    // Find matching templates based on trigger keyword
    const matchingTemplates = templates.filter((template) =>
      lowerContent.includes(template.triggerKeyword.toLowerCase()),
    );

    if (matchingTemplates.length > 0) {
      // Return highest priority matching template
      return matchingTemplates[0];
    }

    // If no keyword match, return the highest priority template as default
    return templates[0];
  }

  /**
   * Send auto-reply for a lead after form submission
   * Sends template text first, then sends each media file as individual message
   * Note: Flow is sent BEFORE this method is called (in SqsConsumerService)
   */
  async sendAutoReply(
    leadId: string,
    messageContent: string,
  ): Promise<Message | null> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['category'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    if (!lead.categoryId) {
      this.logger.log(`Lead ${leadId} has no category, skipping auto-reply`);
      return null;
    }

    const template = await this.selectTemplate(lead.categoryId, messageContent);

    // Get all category media
    let categoryMediaList: CategoryMedia[] = [];
    categoryMediaList = await this.categoryMediaRepository.find({
      where: { categoryId: lead.categoryId },
      order: { createdAt: 'ASC' },
    });

    let savedMessage: Message | null = null;

    // Send template text message if available
    if (template) {
      const textSent = await this.whatsAppService.sendTextMessage(
        lead.phoneNumber,
        template.messageContent,
      );

      // Log the text message
      const textMessage = this.messageRepository.create({
        leadId,
        direction: MessageDirection.OUTBOUND,
        content: template.messageContent,
        status: textSent ? MessageStatus.SENT : MessageStatus.FAILED,
        isAutoReply: true,
      });
      savedMessage = await this.messageRepository.save(textMessage);
      this.logger.log(
        `Auto-reply text sent for lead ${leadId}, message ${savedMessage.id}, status: ${savedMessage.status}`,
      );
    }

    // Send each media file as individual message
    if (categoryMediaList.length > 0) {
      for (const media of categoryMediaList) {
        await this.sendIndividualMedia(leadId, lead.phoneNumber, media);
      }
      this.logger.log(
        `Auto-reply sent ${categoryMediaList.length} media files for lead ${leadId}`,
      );
    }

    return savedMessage;
  }

  /**
   * Send category media only (without template text)
   * Used after user submits lead details form
   */
  async sendCategoryMedia(leadId: string): Promise<void> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['category'],
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    if (!lead.categoryId) {
      this.logger.log(`Lead ${leadId} has no category, skipping media send`);
      return;
    }

    // Get all category media
    const categoryMediaList = await this.categoryMediaRepository.find({
      where: { categoryId: lead.categoryId },
      order: { createdAt: 'ASC' },
    });

    if (categoryMediaList.length === 0) {
      this.logger.log(`No media found for category ${lead.categoryId}`);
      return;
    }

    // Send each media file
    for (const media of categoryMediaList) {
      await this.sendIndividualMedia(leadId, lead.phoneNumber, media);
    }

    this.logger.log(
      `Sent ${categoryMediaList.length} media files for lead ${leadId}`,
    );
  }

  /**
   * Send individual media file as a separate WhatsApp message
   */
  private async sendIndividualMedia(
    leadId: string,
    phoneNumber: string,
    media: CategoryMedia,
  ): Promise<void> {
    try {
      const signedUrl = await this.s3Service.getSignedUrl(media.url);
      let sent = false;

      if (media.type === MediaType.IMAGE) {
        sent = await this.whatsAppService.sendImage(phoneNumber, signedUrl);
      } else if (media.type === MediaType.DOCUMENT) {
        sent = await this.whatsAppService.sendDocument(
          phoneNumber,
          signedUrl,
          media.filename,
        );
      } else if (media.type === MediaType.VIDEO) {
        sent = await this.whatsAppService.sendVideo(phoneNumber, signedUrl);
      }

      // Log each media message in the conversation
      const mediaMessage = this.messageRepository.create({
        leadId,
        direction: MessageDirection.OUTBOUND,
        content: media.filename || media.type,
        mediaUrl: media.url,
        mediaType: media.type,
        status: sent ? MessageStatus.SENT : MessageStatus.FAILED,
        isAutoReply: true,
      });
      await this.messageRepository.save(mediaMessage);

      this.logger.log(
        `Auto-reply media (${media.type}) sent for lead ${leadId}, status: ${sent ? 'SENT' : 'FAILED'}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending individual media for lead ${leadId}:`,
        error,
      );
    }
  }

  // Carousel method commented out - keeping for future use
  // /**
  //  * Send carousel auto-reply with multiple images/videos
  //  * Carousel supports both image and video headers
  //  */
  // private async sendCarouselAutoReply(
  //   phoneNumber: string,
  //   templateContent: string,
  //   mediaList: CategoryMedia[],
  // ): Promise<boolean> {
  //   try {
  //     const cards = await Promise.all(
  //       mediaList.map(async (media) => {
  //         const signedUrl = await this.s3Service.getSignedUrl(media.url);
  //         return {
  //           mediaUrl: signedUrl,
  //           mediaType: media.type === MediaType.VIDEO ? 'video' : 'image',
  //           bodyText: media.filename || media.type,
  //         } as {
  //           mediaUrl: string;
  //           mediaType: 'image' | 'video';
  //           bodyText: string;
  //         };
  //       }),
  //     );
  //     return await this.whatsAppService.sendCarouselMessage(
  //       phoneNumber,
  //       templateContent,
  //       cards,
  //     );
  //   } catch (error) {
  //     this.logger.error('Error sending carousel auto-reply:', error);
  //     return false;
  //   }
  // }
}
