import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import {
  Connector,
  ConnectorLog,
  WebhookPayload,
  Lead,
  User,
} from '../entities';
import {
  ConnectorType,
  ConnectorStatus,
  LeadStatus,
  UserRole,
} from '../common/enums';
import {
  CreateConnectorDto,
  UpdateConnectorDto,
  ConnectorFieldMappingDto,
  ConnectorFilterDto,
  ConnectorLogFilterDto,
} from './dto';

@Injectable()
export class ConnectorService {
  private readonly logger = new Logger(ConnectorService.name);

  // Default field mappings for different connector types
  private readonly defaultFieldMappings: Record<
    ConnectorType,
    Record<string, string>
  > = {
    [ConnectorType.WEBHOOK]: {
      phone: 'phoneNumber',
      name: 'name',
      email: 'email',
      source: 'source',
    },
    [ConnectorType.META]: {
      'field_data.phone_number': 'phoneNumber',
      'field_data.full_name': 'name',
      'field_data.email': 'email',
      ad_name: 'source',
      campaign_name: 'campaign',
    },
    [ConnectorType.GOOGLE]: {
      'user_column_data.PHONE_NUMBER': 'phoneNumber',
      'user_column_data.FULL_NAME': 'name',
      'user_column_data.EMAIL': 'email',
      campaign_id: 'source',
    },
    [ConnectorType.YOUTUBE]: {
      'snippet.channelId': 'externalId',
      'snippet.title': 'name',
      'snippet.description': 'notes',
    },
    [ConnectorType.LINKEDIN]: {
      'formResponse.answers.phoneNumber': 'phoneNumber',
      'formResponse.answers.firstName': 'firstName',
      'formResponse.answers.lastName': 'lastName',
      'formResponse.answers.email': 'email',
      'campaign.name': 'source',
    },
    [ConnectorType.WHATSAPP]: {
      from: 'phoneNumber',
      'profile.name': 'name',
    },
    [ConnectorType.INDIAMART]: {
      SENDER_MOBILE: 'phoneNumber',
      SENDER_NAME: 'name',
      SENDER_EMAIL: 'email',
      SENDER_COMPANY: 'businessName',
      SENDER_ADDRESS: 'addressLine1',
      SENDER_CITY: 'city',
      SENDER_STATE: 'state',
      SENDER_PINCODE: 'pincode',
      SENDER_COUNTRY_ISO: 'country',
      PRODUCT_NAME: 'productName',
      QUERY_MESSAGE: 'notes',
      UNIQUE_QUERY_ID: 'externalId',
    },
    [ConnectorType.TRADEINDIA]: {
      sender_mobile: 'phoneNumber',
      sender_name: 'name',
      sender_email: 'email',
      sender_company: 'businessName',
      sender_address: 'addressLine1',
      sender_city: 'city',
      sender_state: 'state',
      sender_country: 'country',
      product_name: 'productName',
      inquiry_message: 'notes',
      rfi_id: 'externalId',
    },
  };

  constructor(
    @InjectRepository(Connector)
    private readonly connectorRepository: Repository<Connector>,
    @InjectRepository(ConnectorLog)
    private readonly connectorLogRepository: Repository<ConnectorLog>,
    @InjectRepository(WebhookPayload)
    private readonly webhookPayloadRepository: Repository<WebhookPayload>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateConnectorDto, currentUser: User): Promise<Connector> {
    // Check permissions
    this.checkPermission(currentUser, 'create');

    const connector = this.connectorRepository.create({
      name: dto.name,
      type: dto.type,
      description: dto.description,
      config: dto.config || {},
      fieldMapping:
        dto.fieldMapping || this.defaultFieldMappings[dto.type] || {},
      syncIntervalMinutes: dto.syncIntervalMinutes || 15,
      createdById: currentUser.id,
      status: ConnectorStatus.DISCONNECTED,
    });

    // Generate webhook URL and secret for webhook type
    if (dto.type === ConnectorType.WEBHOOK) {
      const webhookId = uuidv4().replace(/-/g, '');
      connector.webhookUrl = `/api/connectors/webhook/${webhookId}`;
      connector.webhookSecret = this.generateWebhookSecret();
    }

    // Generate webhook URL for IndiaMART (Push API)
    if (dto.type === ConnectorType.INDIAMART) {
      const webhookId = uuidv4().replace(/-/g, '');
      connector.webhookUrl = `/api/connectors/indiamart/${webhookId}`;
      connector.webhookSecret = this.generateWebhookSecret();
      connector.config = {
        ...connector.config,
        webhookVerifyToken: this.generateWebhookSecret().substring(0, 32),
      };
    }

    // TradeIndia uses Pull API only
    if (dto.type === ConnectorType.TRADEINDIA) {
      connector.config = {
        ...connector.config,
        lastSyncTime: null,
        syncStatus: 'idle',
      };
    }

    const savedConnector = await this.connectorRepository.save(connector);

    await this.createLog(
      savedConnector.id,
      'created',
      'info',
      'Connector created',
    );
    this.logger.log(
      `Connector ${savedConnector.id} created by user ${currentUser.id}`,
    );

    return savedConnector;
  }

  async findAll(
    filters: ConnectorFilterDto,
    currentUser: User,
  ): Promise<{
    items: Connector[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.connectorRepository
      .createQueryBuilder('connector')
      .leftJoinAndSelect('connector.createdBy', 'createdBy')
      .where('connector.deletedAt IS NULL');

    if (filters.type) {
      query.andWhere('connector.type = :type', { type: filters.type });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('connector.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    query.orderBy('connector.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    // Mask sensitive data
    const maskedItems = items.map((c) => this.maskSensitiveData(c));

    return { items: maskedItems, total, page, limit };
  }

  async findOne(id: string, currentUser: User): Promise<Connector> {
    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['createdBy'],
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    return this.maskSensitiveData(connector);
  }

  async update(
    id: string,
    dto: UpdateConnectorDto,
    currentUser: User,
  ): Promise<Connector> {
    this.checkPermission(currentUser, 'update');

    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    if (dto.name !== undefined) connector.name = dto.name;
    if (dto.description !== undefined) connector.description = dto.description;
    if (dto.config !== undefined)
      connector.config = { ...connector.config, ...dto.config };
    if (dto.fieldMapping !== undefined)
      connector.fieldMapping = dto.fieldMapping;
    if (dto.isActive !== undefined) connector.isActive = dto.isActive;
    if (dto.syncIntervalMinutes !== undefined)
      connector.syncIntervalMinutes = dto.syncIntervalMinutes;

    const savedConnector = await this.connectorRepository.save(connector);

    await this.createLog(
      id,
      'updated',
      'info',
      'Connector configuration updated',
    );
    this.logger.log(`Connector ${id} updated by user ${currentUser.id}`);

    return this.maskSensitiveData(savedConnector);
  }

  async updateFieldMapping(
    id: string,
    dto: ConnectorFieldMappingDto,
    currentUser: User,
  ): Promise<Connector> {
    this.checkPermission(currentUser, 'update');

    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    connector.fieldMapping = dto.fieldMapping;
    const savedConnector = await this.connectorRepository.save(connector);

    await this.createLog(
      id,
      'field_mapping_updated',
      'info',
      'Field mapping updated',
    );

    return this.maskSensitiveData(savedConnector);
  }

  async delete(id: string, currentUser: User): Promise<void> {
    this.checkPermission(currentUser, 'delete');

    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    connector.deletedAt = new Date();
    connector.isActive = false;
    await this.connectorRepository.save(connector);

    await this.createLog(id, 'deleted', 'warning', 'Connector deleted');
    this.logger.log(`Connector ${id} deleted by user ${currentUser.id}`);
  }

  async testConnection(
    id: string,
    currentUser: User,
  ): Promise<{ success: boolean; message: string }> {
    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    try {
      // For webhook connectors, just verify the URL exists
      if (connector.type === ConnectorType.WEBHOOK) {
        await this.createLog(
          id,
          'test_connection',
          'success',
          'Webhook endpoint is ready',
        );
        return {
          success: true,
          message: 'Webhook endpoint is ready to receive data',
        };
      }

      // For OAuth connectors, verify token validity
      if (connector.oauthAccessToken) {
        const isValid = await this.validateOAuthToken(connector);
        if (isValid) {
          connector.status = ConnectorStatus.CONNECTED;
          await this.connectorRepository.save(connector);
          await this.createLog(
            id,
            'test_connection',
            'success',
            'OAuth token is valid',
          );
          return {
            success: true,
            message: 'Connection is active and authenticated',
          };
        } else {
          connector.status = ConnectorStatus.ERROR;
          connector.lastError = 'OAuth token expired or invalid';
          await this.connectorRepository.save(connector);
          await this.createLog(
            id,
            'test_connection',
            'error',
            'OAuth token expired',
          );
          return {
            success: false,
            message: 'OAuth token expired. Please reconnect.',
          };
        }
      }

      return { success: false, message: 'Connector not configured' };
    } catch (error) {
      connector.status = ConnectorStatus.ERROR;
      connector.lastError = error.message;
      await this.connectorRepository.save(connector);
      await this.createLog(id, 'test_connection', 'error', error.message);
      return { success: false, message: error.message };
    }
  }

  async regenerateWebhookSecret(
    id: string,
    currentUser: User,
  ): Promise<{ webhookSecret: string }> {
    this.checkPermission(currentUser, 'update');

    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull(), type: ConnectorType.WEBHOOK },
    });

    if (!connector) {
      throw new NotFoundException(`Webhook connector with ID ${id} not found`);
    }

    connector.webhookSecret = this.generateWebhookSecret();
    await this.connectorRepository.save(connector);

    await this.createLog(
      id,
      'secret_regenerated',
      'warning',
      'Webhook secret regenerated',
    );

    return { webhookSecret: connector.webhookSecret };
  }

  // ============ Webhook Processing ============

  async processWebhook(
    webhookId: string,
    payload: Record<string, any>,
    headers: Record<string, string>,
    ipAddress: string,
  ): Promise<{ success: boolean; leadId?: string; message: string }> {
    // Find connector by webhook URL
    const connector = await this.connectorRepository.findOne({
      where: {
        webhookUrl: `/api/connectors/webhook/${webhookId}`,
        deletedAt: IsNull(),
        isActive: true,
      },
    });

    if (!connector) {
      this.logger.warn(`Webhook received for unknown connector: ${webhookId}`);
      return { success: false, message: 'Connector not found or inactive' };
    }

    // Validate webhook signature if secret is set
    if (connector.webhookSecret) {
      const signature =
        headers['x-webhook-signature'] || headers['x-hub-signature-256'];
      if (
        !this.validateWebhookSignature(
          payload,
          signature,
          connector.webhookSecret,
        )
      ) {
        await this.createLog(
          connector.id,
          'webhook_received',
          'error',
          'Invalid signature',
        );
        return { success: false, message: 'Invalid webhook signature' };
      }
    }

    return this.processIncomingLead(connector, payload, ipAddress, headers);
  }

  // ============ IndiaMART Push API Processing ============

  async processIndiamartWebhook(
    webhookId: string,
    payload: Record<string, any>,
    headers: Record<string, string>,
    ipAddress: string,
  ): Promise<{ success: boolean; leadId?: string; message: string }> {
    // Find connector by IndiaMART webhook URL
    const connector = await this.connectorRepository.findOne({
      where: {
        webhookUrl: `/api/connectors/indiamart/${webhookId}`,
        deletedAt: IsNull(),
        isActive: true,
        type: ConnectorType.INDIAMART,
      },
    });

    if (!connector) {
      this.logger.warn(
        `IndiaMART webhook received for unknown connector: ${webhookId}`,
      );
      return { success: false, message: 'Connector not found or inactive' };
    }

    // Validate IndiaMART specific headers/tokens if configured
    const verifyToken = connector.config?.webhookVerifyToken;
    const receivedToken =
      headers['x-indiamart-token'] || headers['authorization'];
    if (verifyToken && receivedToken !== verifyToken) {
      await this.createLog(
        connector.id,
        'indiamart_webhook',
        'error',
        'Invalid verification token',
      );
      return { success: false, message: 'Invalid verification token' };
    }

    // IndiaMART sends data in specific format - normalize it
    const normalizedPayload = this.normalizeIndiamartPayload(payload);

    this.logger.log(`IndiaMART webhook received for connector ${connector.id}`);

    return this.processIncomingLead(
      connector,
      normalizedPayload,
      ipAddress,
      headers,
      'indiamart',
    );
  }

  private normalizeIndiamartPayload(
    payload: Record<string, any>,
  ): Record<string, any> {
    // IndiaMART Push API sends data in uppercase field names
    // Handle both direct payload and nested data structures
    const data = payload.data || payload;

    return {
      SENDER_MOBILE: data.SENDER_MOBILE || data.sender_mobile || data.mobile,
      SENDER_NAME: data.SENDER_NAME || data.sender_name || data.name,
      SENDER_EMAIL: data.SENDER_EMAIL || data.sender_email || data.email,
      SENDER_COMPANY:
        data.SENDER_COMPANY || data.sender_company || data.company,
      SENDER_ADDRESS:
        data.SENDER_ADDRESS || data.sender_address || data.address,
      SENDER_CITY: data.SENDER_CITY || data.sender_city || data.city,
      SENDER_STATE: data.SENDER_STATE || data.sender_state || data.state,
      SENDER_PINCODE:
        data.SENDER_PINCODE || data.sender_pincode || data.pincode,
      SENDER_COUNTRY_ISO:
        data.SENDER_COUNTRY_ISO || data.sender_country_iso || data.country,
      PRODUCT_NAME: data.PRODUCT_NAME || data.product_name || data.product,
      QUERY_MESSAGE:
        data.QUERY_MESSAGE || data.query_message || data.message || data.query,
      UNIQUE_QUERY_ID:
        data.UNIQUE_QUERY_ID || data.unique_query_id || data.inquiry_id,
      QUERY_TIME: data.QUERY_TIME || data.query_time || data.received_time,
    };
  }

  // ============ TradeIndia Pull API Processing ============

  async syncTradeIndiaLeads(
    connectorId: string,
    currentUser: User,
  ): Promise<{
    success: boolean;
    message: string;
    leadsCreated: number;
    leadsDuplicate: number;
  }> {
    this.checkPermission(currentUser, 'sync');

    const connector = await this.connectorRepository.findOne({
      where: {
        id: connectorId,
        deletedAt: IsNull(),
        type: ConnectorType.TRADEINDIA,
      },
    });

    if (!connector) {
      throw new NotFoundException(
        `TradeIndia connector with ID ${connectorId} not found`,
      );
    }

    if (!connector.isActive) {
      return {
        success: false,
        message: 'Connector is not active',
        leadsCreated: 0,
        leadsDuplicate: 0,
      };
    }

    const { userId, profileId, apiKey } = connector.config || {};
    if (!userId || !profileId || !apiKey) {
      await this.createLog(
        connectorId,
        'tradeindia_sync',
        'error',
        'Missing API credentials',
      );
      return {
        success: false,
        message: 'Missing API credentials (userId, profileId, or apiKey)',
        leadsCreated: 0,
        leadsDuplicate: 0,
      };
    }

    try {
      // Update sync status
      connector.config = { ...connector.config, syncStatus: 'syncing' };
      await this.connectorRepository.save(connector);

      await this.createLog(
        connectorId,
        'tradeindia_sync_start',
        'info',
        'Starting TradeIndia lead sync',
      );

      // Fetch leads from TradeIndia API
      const leads = await this.fetchTradeIndiaLeads(connector);

      let leadsCreated = 0;
      let leadsDuplicate = 0;

      for (const leadData of leads) {
        const result = await this.processIncomingLead(
          connector,
          leadData,
          'tradeindia-api',
          {},
          'tradeindia',
        );

        if (result.success && result.message === 'Lead created successfully') {
          leadsCreated++;
        } else if (result.message === 'Lead already exists') {
          leadsDuplicate++;
        }
      }

      // Update last sync time
      connector.lastSyncAt = new Date();
      connector.status = ConnectorStatus.CONNECTED;
      connector.config = {
        ...connector.config,
        lastSyncTime: new Date().toISOString(),
        syncStatus: 'success',
      };
      await this.connectorRepository.save(connector);

      await this.createLog(
        connectorId,
        'tradeindia_sync_complete',
        'success',
        `Sync completed: ${leadsCreated} created, ${leadsDuplicate} duplicates`,
      );

      this.logger.log(
        `TradeIndia sync completed for connector ${connectorId}: ${leadsCreated} leads created`,
      );

      return {
        success: true,
        message: `Sync completed successfully`,
        leadsCreated,
        leadsDuplicate,
      };
    } catch (error) {
      connector.status = ConnectorStatus.ERROR;
      connector.lastError = error.message;
      connector.config = { ...connector.config, syncStatus: 'failed' };
      await this.connectorRepository.save(connector);

      await this.createLog(
        connectorId,
        'tradeindia_sync_error',
        'error',
        error.message,
      );

      this.logger.error(
        `TradeIndia sync failed for connector ${connectorId}: ${error.message}`,
      );

      return {
        success: false,
        message: error.message,
        leadsCreated: 0,
        leadsDuplicate: 0,
      };
    }
  }

  private async fetchTradeIndiaLeads(
    connector: Connector,
  ): Promise<Record<string, any>[]> {
    const { userId, profileId, apiKey } = connector.config || {};

    // TradeIndia API endpoint
    const apiUrl = `https://www.tradeindia.com/utils/my_aborad.html`;

    try {
      // Make API request to TradeIndia
      const response = await fetch(
        `${apiUrl}?userid=${userId}&profile_id=${profileId}&key=${apiKey}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`TradeIndia API error: ${response.status}`);
      }

      const data = await response.json();

      // TradeIndia returns data in various formats - normalize
      const leads = data.data || data.leads || data.inquiries || [];

      return Array.isArray(leads)
        ? leads.map((lead) => this.normalizeTradeIndiaPayload(lead))
        : [];
    } catch (error) {
      this.logger.error(`Failed to fetch TradeIndia leads: ${error.message}`);
      throw error;
    }
  }

  private normalizeTradeIndiaPayload(
    payload: Record<string, any>,
  ): Record<string, any> {
    return {
      sender_mobile:
        payload.sender_mobile || payload.mobile || payload.phone_number,
      sender_name: payload.sender_name || payload.name || payload.buyer_name,
      sender_email:
        payload.sender_email || payload.email || payload.buyer_email,
      sender_company:
        payload.sender_company || payload.company || payload.buyer_company,
      sender_address: payload.sender_address || payload.address,
      sender_city: payload.sender_city || payload.city,
      sender_state: payload.sender_state || payload.state,
      sender_country: payload.sender_country || payload.country,
      product_name: payload.product_name || payload.product || payload.subject,
      inquiry_message:
        payload.inquiry_message || payload.message || payload.query,
      rfi_id: payload.rfi_id || payload.inquiry_id || payload.id,
      inquiry_time: payload.inquiry_time || payload.date || payload.created_at,
    };
  }

  // ============ Common Lead Processing ============

  private async processIncomingLead(
    connector: Connector,
    payload: Record<string, any>,
    ipAddress: string,
    headers: Record<string, string>,
    source?: string,
  ): Promise<{ success: boolean; leadId?: string; message: string }> {
    // Store raw payload for audit
    const webhookPayloadRecord = this.webhookPayloadRepository.create({
      connectorId: connector.id,
      rawPayload: payload,
      ipAddress,
      userAgent: headers['user-agent'],
      status: 'pending',
    });
    await this.webhookPayloadRepository.save(webhookPayloadRecord);

    try {
      // Normalize data using field mapping
      const normalizedData = this.normalizePayload(
        payload,
        connector.fieldMapping,
      );
      webhookPayloadRecord.normalizedData = normalizedData;

      // Add source metadata
      if (source) {
        normalizedData.source = source;
      }

      // Validate required fields
      if (!normalizedData.phoneNumber) {
        webhookPayloadRecord.status = 'failed';
        webhookPayloadRecord.errorMessage = 'Phone number is required';
        await this.webhookPayloadRepository.save(webhookPayloadRecord);
        await this.createLog(
          connector.id,
          'lead_processed',
          'error',
          'Missing phone number',
          payload,
        );
        return {
          success: false,
          message: 'Phone number is required in payload',
        };
      }

      // Check for duplicates
      const existingLead = await this.leadRepository.findOne({
        where: { phoneNumber: normalizedData.phoneNumber, deletedAt: IsNull() },
      });

      if (existingLead) {
        webhookPayloadRecord.status = 'duplicate';
        webhookPayloadRecord.leadId = existingLead.id;
        await this.webhookPayloadRepository.save(webhookPayloadRecord);
        await this.createLog(
          connector.id,
          'lead_processed',
          'warning',
          `Duplicate lead: ${existingLead.id}`,
          payload,
        );
        return {
          success: true,
          leadId: existingLead.id,
          message: 'Lead already exists',
        };
      }

      // Create lead through lead service
      const lead = await this.createLeadFromWebhook(normalizedData, connector);

      webhookPayloadRecord.status = 'processed';
      webhookPayloadRecord.leadId = lead.id;
      await this.webhookPayloadRepository.save(webhookPayloadRecord);

      // Update connector last sync
      connector.lastSyncAt = new Date();
      connector.status = ConnectorStatus.CONNECTED;
      await this.connectorRepository.save(connector);

      await this.createLog(
        connector.id,
        'lead_processed',
        'success',
        `Lead created: ${lead.id}`,
        payload,
        { leadId: lead.id },
      );

      this.logger.log(
        `Lead processed for connector ${connector.id}, lead created: ${lead.id}`,
      );

      return {
        success: true,
        leadId: lead.id,
        message: 'Lead created successfully',
      };
    } catch (error) {
      webhookPayloadRecord.status = 'failed';
      webhookPayloadRecord.errorMessage = error.message;
      await this.webhookPayloadRepository.save(webhookPayloadRecord);

      connector.lastError = error.message;
      await this.connectorRepository.save(connector);

      await this.createLog(
        connector.id,
        'lead_processed',
        'error',
        error.message,
        payload,
      );

      this.logger.error(
        `Lead processing failed for connector ${connector.id}: ${error.message}`,
      );

      return { success: false, message: error.message };
    }
  }

  async testWebhook(
    id: string,
    payload: Record<string, any>,
    currentUser: User,
  ): Promise<{
    success: boolean;
    normalizedData: Record<string, any>;
    message: string;
  }> {
    const connector = await this.connectorRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!connector) {
      throw new NotFoundException(`Connector with ID ${id} not found`);
    }

    try {
      const normalizedData = this.normalizePayload(
        payload,
        connector.fieldMapping,
      );

      await this.createLog(
        id,
        'test_webhook',
        'info',
        'Test webhook processed',
        payload,
        normalizedData,
      );

      return {
        success: true,
        normalizedData,
        message: 'Payload normalized successfully',
      };
    } catch (error) {
      return {
        success: false,
        normalizedData: {},
        message: error.message,
      };
    }
  }

  // ============ Logs ============

  async getLogs(filters: ConnectorLogFilterDto): Promise<{
    items: ConnectorLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.connectorLogRepository.createQueryBuilder('log');

    if (filters.connectorId) {
      query.andWhere('log.connectorId = :connectorId', {
        connectorId: filters.connectorId,
      });
    }

    if (filters.level) {
      query.andWhere('log.level = :level', { level: filters.level });
    }

    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    query.orderBy('log.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return { items, total, page, limit };
  }

  // ============ OAuth Helpers ============

  async getOAuthUrl(type: ConnectorType, connectorId: string): Promise<string> {
    const baseUrls: Record<string, string> = {
      [ConnectorType.META]: 'https://www.facebook.com/v18.0/dialog/oauth',
      [ConnectorType.GOOGLE]: 'https://accounts.google.com/o/oauth2/v2/auth',
      [ConnectorType.LINKEDIN]:
        'https://www.linkedin.com/oauth/v2/authorization',
    };

    const scopes: Record<string, string> = {
      [ConnectorType.META]:
        'leads_retrieval,pages_show_list,pages_read_engagement',
      [ConnectorType.GOOGLE]: 'https://www.googleapis.com/auth/adwords',
      [ConnectorType.LINKEDIN]: 'r_liteprofile,r_emailaddress,w_member_social',
    };

    const clientIds: Record<string, string> = {
      [ConnectorType.META]: process.env.META_CLIENT_ID || '',
      [ConnectorType.GOOGLE]: process.env.GOOGLE_CLIENT_ID || '',
      [ConnectorType.LINKEDIN]: process.env.LINKEDIN_CLIENT_ID || '',
    };

    const redirectUri = `${process.env.API_BASE_URL}/api/connectors/oauth/callback`;
    const state = Buffer.from(JSON.stringify({ connectorId, type })).toString(
      'base64',
    );

    const params = new URLSearchParams({
      client_id: clientIds[type],
      redirect_uri: redirectUri,
      scope: scopes[type],
      response_type: 'code',
      state,
    });

    return `${baseUrls[type]}?${params.toString()}`;
  }

  async handleOAuthCallback(
    code: string,
    state: string,
  ): Promise<{ success: boolean; connectorId: string; message: string }> {
    try {
      const { connectorId, type } = JSON.parse(
        Buffer.from(state, 'base64').toString(),
      );

      const connector = await this.connectorRepository.findOne({
        where: { id: connectorId, deletedAt: IsNull() },
      });

      if (!connector) {
        return {
          success: false,
          connectorId: '',
          message: 'Connector not found',
        };
      }

      // Exchange code for tokens (simplified - actual implementation would call OAuth provider)
      const tokens = await this.exchangeCodeForTokens(code, type);

      connector.oauthAccessToken = this.encryptToken(tokens.accessToken);
      connector.oauthRefreshToken = tokens.refreshToken
        ? this.encryptToken(tokens.refreshToken)
        : '';
      connector.oauthExpiresAt = tokens.expiresAt;
      connector.oauthScope = tokens.scope;
      connector.status = ConnectorStatus.CONNECTED;

      await this.connectorRepository.save(connector);
      await this.createLog(
        connectorId,
        'oauth_connected',
        'success',
        'OAuth authentication successful',
      );

      return { success: true, connectorId, message: 'Connected successfully' };
    } catch (error) {
      this.logger.error(`OAuth callback failed: ${error.message}`);
      return { success: false, connectorId: '', message: error.message };
    }
  }

  // ============ Private Helpers ============

  private checkPermission(user: User, action: string): void {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        `Only Admin and Manager can ${action} connectors`,
      );
    }
  }

  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private validateWebhookSignature(
    payload: Record<string, any>,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature.replace('sha256=', '')),
      Buffer.from(expectedSignature),
    );
  }

  private normalizePayload(
    payload: Record<string, any>,
    fieldMapping: Record<string, string>,
  ): Record<string, any> {
    const normalized: Record<string, any> = {};

    for (const [sourcePath, targetField] of Object.entries(fieldMapping)) {
      const value = this.getNestedValue(payload, sourcePath);
      if (value !== undefined && value !== null && value !== '') {
        normalized[targetField] = value;
      }
    }

    // Normalize phone number
    if (normalized.phoneNumber) {
      normalized.phoneNumber = this.normalizePhoneNumber(
        normalized.phoneNumber,
      );
    }

    // Combine first and last name if separate
    if (normalized.firstName || normalized.lastName) {
      normalized.name = [normalized.firstName, normalized.lastName]
        .filter(Boolean)
        .join(' ');
      delete normalized.firstName;
      delete normalized.lastName;
    }

    return normalized;
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // Ensure it starts with +
    if (!normalized.startsWith('+')) {
      // Assume Indian number if 10 digits
      if (normalized.length === 10) {
        normalized = '+91' + normalized;
      } else {
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }

  private async createLeadFromWebhook(
    data: Record<string, any>,
    connector: Connector,
  ): Promise<Lead> {
    // Get the default "New" status from LeadStatusMaster
    const { LeadStatusMaster } = await import('../entities');
    const statusMasterRepo =
      this.leadRepository.manager.getRepository(LeadStatusMaster);
    const newStatus = await statusMasterRepo.findOne({
      where: { name: 'New', isActive: true },
    });

    const lead = this.leadRepository.create({
      phoneNumber: data.phoneNumber,
      name: data.name || `Lead from ${connector.name}`,
      email: data.email,
      source: data.source || connector.name,
      status: LeadStatus.NEW,
      statusMasterId: newStatus?.id,
    });

    return this.leadRepository.save(lead);
  }

  private maskSensitiveData(connector: Connector): Connector {
    const masked = { ...connector };
    if (masked.oauthAccessToken) masked.oauthAccessToken = '***ENCRYPTED***';
    if (masked.oauthRefreshToken) masked.oauthRefreshToken = '***ENCRYPTED***';
    if (masked.webhookSecret)
      masked.webhookSecret = masked.webhookSecret.substring(0, 8) + '...';
    return masked;
  }

  private encryptToken(token: string): string {
    // In production, use proper encryption (e.g., AWS KMS, Vault)
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(
        process.env.ENCRYPTION_KEY || 'default-key-32-chars-long!!!!',
      ),
      crypto.randomBytes(16),
    );
    return cipher.update(token, 'utf8', 'hex') + cipher.final('hex');
  }

  private async validateOAuthToken(connector: Connector): Promise<boolean> {
    if (!connector.oauthExpiresAt) return false;
    return new Date() < connector.oauthExpiresAt;
  }

  private async exchangeCodeForTokens(
    code: string,
    type: ConnectorType,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    scope: string;
  }> {
    // Simplified - actual implementation would call OAuth provider
    return {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresAt: new Date(Date.now() + 3600000),
      scope: 'read,write',
    };
  }

  private async createLog(
    connectorId: string,
    action: string,
    level: 'success' | 'error' | 'warning' | 'info',
    message: string,
    rawPayload?: Record<string, any>,
    processedData?: Record<string, any>,
  ): Promise<void> {
    const log = this.connectorLogRepository.create({
      connectorId,
      action,
      level,
      message,
      rawPayload,
      processedData,
    });
    await this.connectorLogRepository.save(log);
  }
}
