import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message as SQSMessage,
} from '@aws-sdk/client-sqs';
import { Lead, Message, Category, User, UserCategory } from '../../entities';
import {
  MessageDirection,
  MessageStatus,
  LeadStatus,
} from '../../common/enums';
import { AutoReplyService } from '../../auto-reply/auto-reply.service';
import { SlaService } from '../../sla/sla.service';
import {
  SqsMessagePayload,
  ParsedSqsMessage,
  FlowResponseData,
} from '../interfaces';
import { ChatGateway } from '../gateways/chat.gateway';
import { WhatsAppService } from '../../common/services/whatsapp.service';
import { CategoryDetectorService } from './category-detector.service';

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumerService.name);
  private sqsClient: SQSClient;
  private queueUrl: string;
  private isPolling = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCategory)
    private readonly userCategoryRepository: Repository<UserCategory>,
    private readonly autoReplyService: AutoReplyService,
    private readonly slaService: SlaService,
    private readonly chatGateway: ChatGateway,
    private readonly whatsAppService: WhatsAppService,
    private readonly categoryDetectorService: CategoryDetectorService,
  ) {
    try {
      const region = this.configService.get<string>('aws.region', 'us-east-1');
      const accessKeyId = this.configService.get<string>('aws.accessKeyId');
      const secretAccessKey = this.configService.get<string>(
        'aws.secretAccessKey',
      );

      this.sqsClient = new SQSClient({
        region,
        credentials:
          accessKeyId && secretAccessKey
            ? { accessKeyId, secretAccessKey }
            : undefined,
      });

      this.queueUrl = this.configService.get<string>('aws.sqs.queueUrl', '');
    } catch (error) {
      throw error;
    }
  }

  async onModuleInit() {
    if (this.queueUrl) {
      this.startPolling();
    } else {
      this.logger.warn('SQS Queue URL not configured, polling disabled');
    }
  }

  onModuleDestroy() {
    this.stopPolling();
  }

  startPolling(): void {
    if (this.isPolling) {
      this.logger.warn('SQS polling already started');
      return;
    }

    this.isPolling = true;
    this.logger.log('Starting SQS message polling');
    this.poll();
  }

  stopPolling(): void {
    this.isPolling = false;
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
    this.logger.log('Stopped SQS message polling');
  }

  private async poll(): Promise<void> {
    if (!this.isPolling) return;

    try {
      const command = new ReceiveMessageCommand({
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
    } catch (error) {
      this.logger.error('Error polling SQS:', error);
    }

    if (this.isPolling) {
      this.pollInterval = setTimeout(() => this.poll(), 1000);
    }
  }

  async processMessage(message: SQSMessage): Promise<void> {
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

      // Check for duplicate message - same phone + content within last 60 seconds
      const recentCutoff = new Date(Date.now() - 60000);
      const existingLead = await this.leadRepository.findOne({
        where: { phoneNumber: parsed.phoneNumber, deletedAt: IsNull() },
      });

      if (existingLead) {
        const duplicateMessage = await this.messageRepository
          .createQueryBuilder('msg')
          .where('msg.leadId = :leadId', { leadId: existingLead.id })
          .andWhere('msg.content = :content', { content: parsed.content })
          .andWhere('msg.direction = :direction', {
            direction: MessageDirection.INBOUND,
          })
          .andWhere('msg.createdAt > :cutoff', { cutoff: recentCutoff })
          .getOne();

        if (duplicateMessage) {
          this.logger.log(
            `Duplicate message detected for ${parsed.phoneNumber}, skipping`,
          );
          if (message.ReceiptHandle) {
            await this.deleteMessage(message.ReceiptHandle);
          }
          return;
        }
      }

      this.logger.log(
        `Processing inbound message from ${parsed.phoneNumber}, type: ${parsed.messageType || 'text'}`,
      );

      // Handle different message types
      if (parsed.messageType === 'list_reply' && parsed.listReplyId) {
        // User selected a category from the list
        await this.handleCategorySelection(parsed);
      } else if (parsed.messageType === 'nfm_reply' && parsed.flowToken) {
        // User submitted the lead details flow
        await this.handleFlowResponse(parsed);
      } else {
        // Regular text/media message - new lead flow
        await this.handleNewMessage(parsed);
      }

      if (message.ReceiptHandle) {
        await this.deleteMessage(message.ReceiptHandle);
      }
    } catch (error) {
      this.logger.error('Error processing SQS message:', error);
      // Don't delete message on error - let it retry after visibility timeout
    }
  }

  /**
   * Handle new text/media message
   * Flow:
   * 1. Try to detect category from message content
   * 2. If category found -> Send lead details flow
   * 3. If category NOT found -> Send category selection list
   */
  private async handleNewMessage(parsed: ParsedSqsMessage): Promise<void> {
    // Check if lead already exists
    let lead = await this.leadRepository.findOne({
      where: { phoneNumber: parsed.phoneNumber, deletedAt: IsNull() },
      relations: ['category'],
    });

    if (lead) {
      // Existing lead - just store the message and notify
      const storedMessage = await this.storeInboundMessage(lead.id, parsed);
      this.chatGateway.notifyNewMessage(lead.id, storedMessage);

      // Also notify eligible users for notifications
      await this.notifyEligibleUsers(lead, storedMessage);

      this.logger.log(`Message stored for existing lead ${lead.id}`);
      return;
    }

    // New lead - try to detect category
    const detectedCategory = await this.categoryDetectorService.detectCategory(
      parsed.content,
    );

    if (detectedCategory) {
      // Category found - create lead with category and send lead details flow
      this.logger.log(
        `Category detected: ${detectedCategory.name} for ${parsed.phoneNumber}`,
      );

      lead = await this.createLead(
        parsed.phoneNumber,
        parsed.customerName,
        detectedCategory.id,
      );

      // Store the inbound message
      const storedMessage = await this.storeInboundMessage(lead.id, parsed);
      this.chatGateway.notifyNewMessage(lead.id, storedMessage);

      // Also notify eligible users for notifications
      await this.notifyEligibleUsers(lead, storedMessage);

      // Send lead details flow with category info in token
      await this.whatsAppService.sendLeadGenerateFlow(
        parsed.phoneNumber,
        `${lead.id}~${detectedCategory.id}`,
      );

      // Log the flow message
      await this.logOutboundMessage(lead.id, 'Lead details form sent', true);
    } else {
      // Category NOT found - create lead without category and send selection list
      this.logger.log(
        `No category detected for ${parsed.phoneNumber}, sending selection list`,
      );

      lead = await this.createLead(
        parsed.phoneNumber,
        parsed.customerName,
        undefined, // No category yet
      );

      // Store the inbound message
      const storedMessage = await this.storeInboundMessage(lead.id, parsed);
      this.chatGateway.notifyNewMessage(lead.id, storedMessage);

      // Also notify eligible users for notifications
      await this.notifyEligibleUsers(lead, storedMessage);

      // Get all active categories for selection
      const categories = await this.categoryRepository.find({
        where: { isActive: true, deletedAt: IsNull() },
        select: ['id', 'name', 'description'],
      });

      if (categories.length > 0) {
        // Send category selection list
        await this.whatsAppService.sendCategorySelectionList(
          parsed.phoneNumber,
          parsed.customerName || '',
          categories,
        );

        // Log the selection list message
        await this.logOutboundMessage(
          lead.id,
          'Category selection list sent',
          true,
        );
      } else {
        this.logger.warn('No active categories available for selection');
      }
    }

    // Initialize SLA tracking
    try {
      await this.slaService.initializeSlaTracking(lead.id);
    } catch (slaError: any) {
      this.logger.warn(
        `SLA tracking init failed for lead ${lead.id}: ${slaError.message}`,
      );
    }
  }

  /**
   * Handle category selection from list reply
   * Flow:
   * 1. Update lead with selected category
   * 2. Send lead details flow
   */
  private async handleCategorySelection(
    parsed: ParsedSqsMessage,
  ): Promise<void> {
    // Extract category ID from list reply ID (format: "category_select~{categoryId}")
    const listReplyId = parsed.listReplyId || '';
    if (!listReplyId.startsWith('category_select~')) {
      this.logger.warn(`Unknown list reply ID: ${listReplyId}`);
      return;
    }

    const categoryId = listReplyId.replace('category_select~', '');

    // Find the lead
    const lead = await this.leadRepository.findOne({
      where: { phoneNumber: parsed.phoneNumber, deletedAt: IsNull() },
    });

    if (!lead) {
      this.logger.warn(
        `Lead not found for category selection: ${parsed.phoneNumber}`,
      );
      return;
    }

    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, isActive: true, deletedAt: IsNull() },
    });

    if (!category) {
      this.logger.warn(`Category not found: ${categoryId}`);
      return;
    }

    // Update lead with selected category
    lead.categoryId = categoryId;
    await this.leadRepository.save(lead);

    this.logger.log(`Lead ${lead.id} updated with category: ${category.name}`);

    // Store the selection as a message
    await this.storeInboundMessage(lead.id, {
      ...parsed,
      content: `Selected category: ${category.name}`,
    });

    // Send lead details flow with category info
    await this.whatsAppService.sendLeadGenerateFlow(
      parsed.phoneNumber,
      `${lead.id}~${categoryId}`,
    );

    // Log the flow message
    await this.logOutboundMessage(lead.id, 'Lead details form sent', true);
  }

  /**
   * Handle flow response (nfm_reply) - user submitted lead details form
   * Flow data format:
   * {
   *   "name": "dakshesh",
   *   "buisness_name": "mehta",  // optional
   *   "email": "dakshesh@gmail.com",  // optional
   *   "pincode": "394210",  // optional
   *   "terms_agreement": true,
   *   "offers_acceptance": true
   * }
   * Flow:
   * 1. Update lead with customer details (name, businessName, email, pincode)
   * 2. Send category media (auto-reply)
   * 3. Assign to Customer Executive
   */
  private async handleFlowResponse(parsed: ParsedSqsMessage): Promise<void> {
    if (!parsed.flowToken || !parsed.flowData) {
      this.logger.warn('Flow response missing token or data');
      return;
    }

    // Parse flow token: "{leadId}~{categoryId}" or "lead_generate~{leadId}"
    const tokenParts = parsed.flowToken.split('~');
    let leadId: string;
    let categoryId: string | undefined;

    if (tokenParts[0] === 'lead_generate') {
      // Old format: lead_generate~{leadId}
      leadId = tokenParts[1];
    } else {
      // New format: {leadId}~{categoryId}
      leadId = tokenParts[0];
      categoryId = tokenParts[1];
    }

    if (!leadId) {
      this.logger.warn(`Invalid flow token: ${parsed.flowToken}`);
      return;
    }

    // Find the lead
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['category'],
    });

    if (!lead) {
      this.logger.warn(`Lead not found for flow response: ${leadId}`);
      return;
    }

    // Update lead with flow data
    const flowData = parsed.flowData;

    // Handle name - can be single "name" field or "first_name" + "last_name"
    if (flowData.name) {
      lead.name = flowData.name;
    }

    // Handle optional fields
    if (flowData.business_name) {
      lead.businessName = flowData.business_name;
    }

    if (flowData.email) {
      lead.email = flowData.email;
    }

    if (flowData.pincode) {
      lead.pincode = String(flowData.pincode); // Convert to string in case it's a number
    }

    // Update category if provided in token and not already set
    if (categoryId && !lead.categoryId) {
      lead.categoryId = categoryId;
    }

    // Find and assign to a Customer Executive
    const assignedUserId = await this.findAvailableExecutive(
      lead.categoryId || categoryId,
    );
    if (assignedUserId) {
      lead.assignedToId = assignedUserId;
      lead.claimedAt = new Date();
    }

    await this.leadRepository.save(lead);

    this.logger.log(
      `Lead ${leadId} updated from flow: name="${lead.name}", businessName="${lead.businessName || 'N/A'}", email="${lead.email || 'N/A'}", pincode="${lead.pincode || 'N/A'}", assigned to: ${assignedUserId || 'unassigned'}`,
    );

    // Store the flow response as a message
    const detailsParts = [`Name: ${lead.name || 'N/A'}`];
    if (lead.businessName) detailsParts.push(`Business: ${lead.businessName}`);
    if (lead.email) detailsParts.push(`Email: ${lead.email}`);
    if (lead.pincode) detailsParts.push(`Pincode: ${lead.pincode}`);

    const responseContent = `Customer submitted details:\n${detailsParts.join('\n')}`;
    const flowMessage = this.messageRepository.create({
      leadId,
      direction: MessageDirection.INBOUND,
      content: responseContent,
      status: MessageStatus.DELIVERED,
      isAutoReply: false,
    });
    const savedFlowMessage = await this.messageRepository.save(flowMessage);
    this.chatGateway.notifyNewMessage(leadId, savedFlowMessage);

    // Also notify eligible users for notifications
    await this.notifyEligibleUsers(lead, savedFlowMessage);

    // Send category media as auto-reply
    const effectiveCategoryId = lead.categoryId || categoryId;
    if (effectiveCategoryId) {
      await this.autoReplyService.sendAutoReply(leadId, '');
    }
  }

  /**
   * Create a new lead
   */
  private async createLead(
    phoneNumber: string,
    customerName?: string,
    categoryId?: string | null,
  ): Promise<Lead> {
    const lead = this.leadRepository.create({
      phoneNumber,
      name: customerName || `Customer ${phoneNumber.slice(-4)}`,
      status: LeadStatus.NEW,
      categoryId: categoryId || null, // Explicitly set to null if not provided
    });

    const savedLead = await this.leadRepository.save(lead);

    this.logger.log(
      `Created new lead ${savedLead.id} for ${phoneNumber}, category: ${categoryId || 'pending selection'}`,
    );

    return savedLead;
  }

  /**
   * Find an available Customer Executive for a category using round-robin
   */
  private async findAvailableExecutive(
    categoryId?: string,
  ): Promise<string | null> {
    if (!categoryId) {
      this.logger.log('No category ID provided for executive assignment');
      return null;
    }

    // Get all active Customer Executives assigned to this category
    const userCategories = await this.userCategoryRepository.find({
      where: { categoryId },
      relations: ['user'],
    });

    const activeExecutives = userCategories
      .filter(
        (uc) =>
          uc.user && uc.user.isActive && uc.user.role === 'customer_executive',
      )
      .map((uc) => uc.user);

    if (activeExecutives.length === 0) {
      this.logger.log(
        `No active Customer Executives found for category ${categoryId}`,
      );
      return null;
    }

    // Round-robin: Find the executive with the least leads assigned today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minLeads = Infinity;
    let selectedExecutive: User | null = null;

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
      this.logger.log(
        `Auto-assigning to ${selectedExecutive.name} (${selectedExecutive.id}) with ${minLeads} leads`,
      );
      return selectedExecutive.id;
    }

    // Fallback: just pick the first one
    return activeExecutives[0].id;
  }

  /**
   * Store inbound message in database
   */
  private async storeInboundMessage(
    leadId: string,
    parsed: ParsedSqsMessage,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      leadId,
      direction: MessageDirection.INBOUND,
      content: parsed.content,
      mediaUrl: parsed.mediaUrl,
      mediaType: parsed.mediaType as any,
      status: MessageStatus.DELIVERED,
      isAutoReply: false,
    });

    const savedMessage = await this.messageRepository.save(message);
    this.logger.log(
      `Stored inbound message ${savedMessage.id} for lead ${leadId}`,
    );

    return savedMessage;
  }

  /**
   * Log outbound message (for tracking auto-replies and system messages)
   */
  private async logOutboundMessage(
    leadId: string,
    content: string,
    isAutoReply: boolean,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      leadId,
      direction: MessageDirection.OUTBOUND,
      content,
      status: MessageStatus.SENT,
      isAutoReply,
    });

    return this.messageRepository.save(message);
  }

  parseMessage(body: string): ParsedSqsMessage | null {
    try {
      const payload: SqsMessagePayload = JSON.parse(body);

      // Validate required fields
      if (!payload.from || !payload.timestamp || !payload.type) {
        this.logger.warn('Missing required fields in SQS message');
        return null;
      }

      // Extract content based on message type
      let content = '';
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;
      let messageType = payload.type;
      let interactiveType: string | undefined;
      let listReplyId: string | undefined;
      let listReplyTitle: string | undefined;
      let flowToken: string | undefined;
      let flowData: FlowResponseData | undefined;

      switch (payload.type) {
        case 'text':
          content = payload.text?.body || '';
          break;

        case 'image':
          content = payload.image?.caption || '[Image]';
          mediaUrl = payload.image?.id; // WhatsApp media ID
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
            } else if (payload.interactive.type === 'button_reply') {
              messageType = 'button_reply';
              content = payload.interactive.button_reply?.title || '';
            } else if (payload.interactive.type === 'nfm_reply') {
              messageType = 'nfm_reply';
              content = payload.interactive.nfm_reply?.body || '';

              // Parse the response_json to extract flow data
              if (payload.interactive.nfm_reply?.response_json) {
                try {
                  const responseData = JSON.parse(
                    payload.interactive.nfm_reply.response_json,
                  );
                  // Extract flow token from the response or use a default pattern
                  flowToken = responseData.flow_token;
                  flowData = {
                    // New format fields
                    name: responseData.name,
                    buisness_name: responseData.buisness_name,
                    business_name: responseData.business_name,
                    pincode: responseData.pincode,
                    // Legacy format fields
                    first_name: responseData.first_name,
                    last_name: responseData.last_name,
                    // Common fields
                    email: responseData.email,
                    terms_agreement: responseData.terms_agreement,
                    offers_acceptance: responseData.offers_acceptance,
                    selected_category_id: responseData.selected_category_id,
                  };
                } catch (parseError) {
                  this.logger.warn('Failed to parse nfm_reply response_json');
                }
              }
            }
          }
          break;

        default:
          content = `[${payload.type}]`;
      }

      // Convert Unix timestamp to Date
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
    } catch (error) {
      this.logger.error('Error parsing SQS message body:', error);
      return null;
    }
  }

  private normalizePhoneNumber(phone: string): string {
    let normalized = phone.replace(/[^\d+]/g, '');
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    return normalized;
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });
      await this.sqsClient.send(command);
      this.logger.debug('Message deleted from SQS');
    } catch (error) {
      this.logger.error('Error deleting SQS message:', error);
    }
  }

  isActive(): boolean {
    return this.isPolling;
  }

  /**
   * Notify eligible users about new messages based on their role and access
   */
  private async notifyEligibleUsers(
    lead: Lead,
    message: Message,
  ): Promise<void> {
    try {
      // Get all active users
      const users = await this.userRepository.find({
        where: { isActive: true, deletedAt: IsNull() },
        relations: ['categories'],
      });

      const eligibleUserIds: string[] = [];

      for (const user of users) {
        let hasAccess = false;

        switch (user.role) {
          case 'admin':
            // Admin sees all leads
            hasAccess = true;
            break;

          case 'manager':
            // Manager sees leads in their categories
            const managerCategories = user.categories?.map((c) => c.id) || [];
            hasAccess =
              !lead.categoryId || managerCategories.includes(lead.categoryId);
            break;

          case 'customer_executive':
            // Customer Executive sees only assigned leads
            hasAccess = lead.assignedToId === user.id;
            break;

          default:
            hasAccess = false;
        }

        if (hasAccess) {
          eligibleUserIds.push(user.id);
        }
      }

      // Send notification to each eligible user
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
        this.logger.log(
          `Sent notification to user ${userId} for lead ${lead.id}`,
        );
      }

      this.logger.log(
        `Notified ${eligibleUserIds.length} eligible users about message from lead ${lead.id}`,
      );
    } catch (error) {
      this.logger.error('Error notifying eligible users:', error);
    }
  }
}
