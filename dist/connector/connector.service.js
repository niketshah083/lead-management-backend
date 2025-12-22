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
var ConnectorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
let ConnectorService = ConnectorService_1 = class ConnectorService {
    connectorRepository;
    connectorLogRepository;
    webhookPayloadRepository;
    leadRepository;
    userRepository;
    logger = new common_1.Logger(ConnectorService_1.name);
    defaultFieldMappings = {
        [enums_1.ConnectorType.WEBHOOK]: {
            phone: 'phoneNumber',
            name: 'name',
            email: 'email',
            source: 'source',
        },
        [enums_1.ConnectorType.META]: {
            'field_data.phone_number': 'phoneNumber',
            'field_data.full_name': 'name',
            'field_data.email': 'email',
            ad_name: 'source',
            campaign_name: 'campaign',
        },
        [enums_1.ConnectorType.GOOGLE]: {
            'user_column_data.PHONE_NUMBER': 'phoneNumber',
            'user_column_data.FULL_NAME': 'name',
            'user_column_data.EMAIL': 'email',
            campaign_id: 'source',
        },
        [enums_1.ConnectorType.YOUTUBE]: {
            'snippet.channelId': 'externalId',
            'snippet.title': 'name',
            'snippet.description': 'notes',
        },
        [enums_1.ConnectorType.LINKEDIN]: {
            'formResponse.answers.phoneNumber': 'phoneNumber',
            'formResponse.answers.firstName': 'firstName',
            'formResponse.answers.lastName': 'lastName',
            'formResponse.answers.email': 'email',
            'campaign.name': 'source',
        },
        [enums_1.ConnectorType.WHATSAPP]: {
            from: 'phoneNumber',
            'profile.name': 'name',
        },
        [enums_1.ConnectorType.INDIAMART]: {
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
        [enums_1.ConnectorType.TRADEINDIA]: {
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
    constructor(connectorRepository, connectorLogRepository, webhookPayloadRepository, leadRepository, userRepository) {
        this.connectorRepository = connectorRepository;
        this.connectorLogRepository = connectorLogRepository;
        this.webhookPayloadRepository = webhookPayloadRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
    }
    async create(dto, currentUser) {
        this.checkPermission(currentUser, 'create');
        const connector = this.connectorRepository.create({
            name: dto.name,
            type: dto.type,
            description: dto.description,
            config: dto.config || {},
            fieldMapping: dto.fieldMapping || this.defaultFieldMappings[dto.type] || {},
            syncIntervalMinutes: dto.syncIntervalMinutes || 15,
            createdById: currentUser.id,
            status: enums_1.ConnectorStatus.DISCONNECTED,
        });
        if (dto.type === enums_1.ConnectorType.WEBHOOK) {
            const webhookId = (0, uuid_1.v4)().replace(/-/g, '');
            connector.webhookUrl = `/api/connectors/webhook/${webhookId}`;
            connector.webhookSecret = this.generateWebhookSecret();
        }
        if (dto.type === enums_1.ConnectorType.INDIAMART) {
            const webhookId = (0, uuid_1.v4)().replace(/-/g, '');
            connector.webhookUrl = `/api/connectors/indiamart/${webhookId}`;
            connector.webhookSecret = this.generateWebhookSecret();
            connector.config = {
                ...connector.config,
                webhookVerifyToken: this.generateWebhookSecret().substring(0, 32),
            };
        }
        if (dto.type === enums_1.ConnectorType.TRADEINDIA) {
            connector.config = {
                ...connector.config,
                lastSyncTime: null,
                syncStatus: 'idle',
            };
        }
        const savedConnector = await this.connectorRepository.save(connector);
        await this.createLog(savedConnector.id, 'created', 'info', 'Connector created');
        this.logger.log(`Connector ${savedConnector.id} created by user ${currentUser.id}`);
        return savedConnector;
    }
    async findAll(filters, currentUser) {
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
        const maskedItems = items.map((c) => this.maskSensitiveData(c));
        return { items: maskedItems, total, page, limit };
    }
    async findOne(id, currentUser) {
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['createdBy'],
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Connector with ID ${id} not found`);
        }
        return this.maskSensitiveData(connector);
    }
    async update(id, dto, currentUser) {
        this.checkPermission(currentUser, 'update');
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Connector with ID ${id} not found`);
        }
        if (dto.name !== undefined)
            connector.name = dto.name;
        if (dto.description !== undefined)
            connector.description = dto.description;
        if (dto.config !== undefined)
            connector.config = { ...connector.config, ...dto.config };
        if (dto.fieldMapping !== undefined)
            connector.fieldMapping = dto.fieldMapping;
        if (dto.isActive !== undefined)
            connector.isActive = dto.isActive;
        if (dto.syncIntervalMinutes !== undefined)
            connector.syncIntervalMinutes = dto.syncIntervalMinutes;
        const savedConnector = await this.connectorRepository.save(connector);
        await this.createLog(id, 'updated', 'info', 'Connector configuration updated');
        this.logger.log(`Connector ${id} updated by user ${currentUser.id}`);
        return this.maskSensitiveData(savedConnector);
    }
    async updateFieldMapping(id, dto, currentUser) {
        this.checkPermission(currentUser, 'update');
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Connector with ID ${id} not found`);
        }
        connector.fieldMapping = dto.fieldMapping;
        const savedConnector = await this.connectorRepository.save(connector);
        await this.createLog(id, 'field_mapping_updated', 'info', 'Field mapping updated');
        return this.maskSensitiveData(savedConnector);
    }
    async delete(id, currentUser) {
        this.checkPermission(currentUser, 'delete');
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Connector with ID ${id} not found`);
        }
        connector.deletedAt = new Date();
        connector.isActive = false;
        await this.connectorRepository.save(connector);
        await this.createLog(id, 'deleted', 'warning', 'Connector deleted');
        this.logger.log(`Connector ${id} deleted by user ${currentUser.id}`);
    }
    async testConnection(id, currentUser) {
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Connector with ID ${id} not found`);
        }
        try {
            if (connector.type === enums_1.ConnectorType.WEBHOOK) {
                await this.createLog(id, 'test_connection', 'success', 'Webhook endpoint is ready');
                return {
                    success: true,
                    message: 'Webhook endpoint is ready to receive data',
                };
            }
            if (connector.oauthAccessToken) {
                const isValid = await this.validateOAuthToken(connector);
                if (isValid) {
                    connector.status = enums_1.ConnectorStatus.CONNECTED;
                    await this.connectorRepository.save(connector);
                    await this.createLog(id, 'test_connection', 'success', 'OAuth token is valid');
                    return {
                        success: true,
                        message: 'Connection is active and authenticated',
                    };
                }
                else {
                    connector.status = enums_1.ConnectorStatus.ERROR;
                    connector.lastError = 'OAuth token expired or invalid';
                    await this.connectorRepository.save(connector);
                    await this.createLog(id, 'test_connection', 'error', 'OAuth token expired');
                    return {
                        success: false,
                        message: 'OAuth token expired. Please reconnect.',
                    };
                }
            }
            return { success: false, message: 'Connector not configured' };
        }
        catch (error) {
            connector.status = enums_1.ConnectorStatus.ERROR;
            connector.lastError = error.message;
            await this.connectorRepository.save(connector);
            await this.createLog(id, 'test_connection', 'error', error.message);
            return { success: false, message: error.message };
        }
    }
    async regenerateWebhookSecret(id, currentUser) {
        this.checkPermission(currentUser, 'update');
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)(), type: enums_1.ConnectorType.WEBHOOK },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Webhook connector with ID ${id} not found`);
        }
        connector.webhookSecret = this.generateWebhookSecret();
        await this.connectorRepository.save(connector);
        await this.createLog(id, 'secret_regenerated', 'warning', 'Webhook secret regenerated');
        return { webhookSecret: connector.webhookSecret };
    }
    async processWebhook(webhookId, payload, headers, ipAddress) {
        const connector = await this.connectorRepository.findOne({
            where: {
                webhookUrl: `/api/connectors/webhook/${webhookId}`,
                deletedAt: (0, typeorm_2.IsNull)(),
                isActive: true,
            },
        });
        if (!connector) {
            this.logger.warn(`Webhook received for unknown connector: ${webhookId}`);
            return { success: false, message: 'Connector not found or inactive' };
        }
        if (connector.webhookSecret) {
            const signature = headers['x-webhook-signature'] || headers['x-hub-signature-256'];
            if (!this.validateWebhookSignature(payload, signature, connector.webhookSecret)) {
                await this.createLog(connector.id, 'webhook_received', 'error', 'Invalid signature');
                return { success: false, message: 'Invalid webhook signature' };
            }
        }
        return this.processIncomingLead(connector, payload, ipAddress, headers);
    }
    async processIndiamartWebhook(webhookId, payload, headers, ipAddress) {
        const connector = await this.connectorRepository.findOne({
            where: {
                webhookUrl: `/api/connectors/indiamart/${webhookId}`,
                deletedAt: (0, typeorm_2.IsNull)(),
                isActive: true,
                type: enums_1.ConnectorType.INDIAMART,
            },
        });
        if (!connector) {
            this.logger.warn(`IndiaMART webhook received for unknown connector: ${webhookId}`);
            return { success: false, message: 'Connector not found or inactive' };
        }
        const verifyToken = connector.config?.webhookVerifyToken;
        const receivedToken = headers['x-indiamart-token'] || headers['authorization'];
        if (verifyToken && receivedToken !== verifyToken) {
            await this.createLog(connector.id, 'indiamart_webhook', 'error', 'Invalid verification token');
            return { success: false, message: 'Invalid verification token' };
        }
        const normalizedPayload = this.normalizeIndiamartPayload(payload);
        this.logger.log(`IndiaMART webhook received for connector ${connector.id}`);
        return this.processIncomingLead(connector, normalizedPayload, ipAddress, headers, 'indiamart');
    }
    normalizeIndiamartPayload(payload) {
        const data = payload.data || payload;
        return {
            SENDER_MOBILE: data.SENDER_MOBILE || data.sender_mobile || data.mobile,
            SENDER_NAME: data.SENDER_NAME || data.sender_name || data.name,
            SENDER_EMAIL: data.SENDER_EMAIL || data.sender_email || data.email,
            SENDER_COMPANY: data.SENDER_COMPANY || data.sender_company || data.company,
            SENDER_ADDRESS: data.SENDER_ADDRESS || data.sender_address || data.address,
            SENDER_CITY: data.SENDER_CITY || data.sender_city || data.city,
            SENDER_STATE: data.SENDER_STATE || data.sender_state || data.state,
            SENDER_PINCODE: data.SENDER_PINCODE || data.sender_pincode || data.pincode,
            SENDER_COUNTRY_ISO: data.SENDER_COUNTRY_ISO || data.sender_country_iso || data.country,
            PRODUCT_NAME: data.PRODUCT_NAME || data.product_name || data.product,
            QUERY_MESSAGE: data.QUERY_MESSAGE || data.query_message || data.message || data.query,
            UNIQUE_QUERY_ID: data.UNIQUE_QUERY_ID || data.unique_query_id || data.inquiry_id,
            QUERY_TIME: data.QUERY_TIME || data.query_time || data.received_time,
        };
    }
    async syncTradeIndiaLeads(connectorId, currentUser) {
        this.checkPermission(currentUser, 'sync');
        const connector = await this.connectorRepository.findOne({
            where: {
                id: connectorId,
                deletedAt: (0, typeorm_2.IsNull)(),
                type: enums_1.ConnectorType.TRADEINDIA,
            },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`TradeIndia connector with ID ${connectorId} not found`);
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
            await this.createLog(connectorId, 'tradeindia_sync', 'error', 'Missing API credentials');
            return {
                success: false,
                message: 'Missing API credentials (userId, profileId, or apiKey)',
                leadsCreated: 0,
                leadsDuplicate: 0,
            };
        }
        try {
            connector.config = { ...connector.config, syncStatus: 'syncing' };
            await this.connectorRepository.save(connector);
            await this.createLog(connectorId, 'tradeindia_sync_start', 'info', 'Starting TradeIndia lead sync');
            const leads = await this.fetchTradeIndiaLeads(connector);
            let leadsCreated = 0;
            let leadsDuplicate = 0;
            for (const leadData of leads) {
                const result = await this.processIncomingLead(connector, leadData, 'tradeindia-api', {}, 'tradeindia');
                if (result.success && result.message === 'Lead created successfully') {
                    leadsCreated++;
                }
                else if (result.message === 'Lead already exists') {
                    leadsDuplicate++;
                }
            }
            connector.lastSyncAt = new Date();
            connector.status = enums_1.ConnectorStatus.CONNECTED;
            connector.config = {
                ...connector.config,
                lastSyncTime: new Date().toISOString(),
                syncStatus: 'success',
            };
            await this.connectorRepository.save(connector);
            await this.createLog(connectorId, 'tradeindia_sync_complete', 'success', `Sync completed: ${leadsCreated} created, ${leadsDuplicate} duplicates`);
            this.logger.log(`TradeIndia sync completed for connector ${connectorId}: ${leadsCreated} leads created`);
            return {
                success: true,
                message: `Sync completed successfully`,
                leadsCreated,
                leadsDuplicate,
            };
        }
        catch (error) {
            connector.status = enums_1.ConnectorStatus.ERROR;
            connector.lastError = error.message;
            connector.config = { ...connector.config, syncStatus: 'failed' };
            await this.connectorRepository.save(connector);
            await this.createLog(connectorId, 'tradeindia_sync_error', 'error', error.message);
            this.logger.error(`TradeIndia sync failed for connector ${connectorId}: ${error.message}`);
            return {
                success: false,
                message: error.message,
                leadsCreated: 0,
                leadsDuplicate: 0,
            };
        }
    }
    async fetchTradeIndiaLeads(connector) {
        const { userId, profileId, apiKey } = connector.config || {};
        const apiUrl = `https://www.tradeindia.com/utils/my_aborad.html`;
        try {
            const response = await fetch(`${apiUrl}?userid=${userId}&profile_id=${profileId}&key=${apiKey}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`TradeIndia API error: ${response.status}`);
            }
            const data = await response.json();
            const leads = data.data || data.leads || data.inquiries || [];
            return Array.isArray(leads)
                ? leads.map((lead) => this.normalizeTradeIndiaPayload(lead))
                : [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch TradeIndia leads: ${error.message}`);
            throw error;
        }
    }
    normalizeTradeIndiaPayload(payload) {
        return {
            sender_mobile: payload.sender_mobile || payload.mobile || payload.phone_number,
            sender_name: payload.sender_name || payload.name || payload.buyer_name,
            sender_email: payload.sender_email || payload.email || payload.buyer_email,
            sender_company: payload.sender_company || payload.company || payload.buyer_company,
            sender_address: payload.sender_address || payload.address,
            sender_city: payload.sender_city || payload.city,
            sender_state: payload.sender_state || payload.state,
            sender_country: payload.sender_country || payload.country,
            product_name: payload.product_name || payload.product || payload.subject,
            inquiry_message: payload.inquiry_message || payload.message || payload.query,
            rfi_id: payload.rfi_id || payload.inquiry_id || payload.id,
            inquiry_time: payload.inquiry_time || payload.date || payload.created_at,
        };
    }
    async processIncomingLead(connector, payload, ipAddress, headers, source) {
        const webhookPayloadRecord = this.webhookPayloadRepository.create({
            connectorId: connector.id,
            rawPayload: payload,
            ipAddress,
            userAgent: headers['user-agent'],
            status: 'pending',
        });
        await this.webhookPayloadRepository.save(webhookPayloadRecord);
        try {
            const normalizedData = this.normalizePayload(payload, connector.fieldMapping);
            webhookPayloadRecord.normalizedData = normalizedData;
            if (source) {
                normalizedData.source = source;
            }
            if (!normalizedData.phoneNumber) {
                webhookPayloadRecord.status = 'failed';
                webhookPayloadRecord.errorMessage = 'Phone number is required';
                await this.webhookPayloadRepository.save(webhookPayloadRecord);
                await this.createLog(connector.id, 'lead_processed', 'error', 'Missing phone number', payload);
                return {
                    success: false,
                    message: 'Phone number is required in payload',
                };
            }
            const existingLead = await this.leadRepository.findOne({
                where: { phoneNumber: normalizedData.phoneNumber, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (existingLead) {
                webhookPayloadRecord.status = 'duplicate';
                webhookPayloadRecord.leadId = existingLead.id;
                await this.webhookPayloadRepository.save(webhookPayloadRecord);
                await this.createLog(connector.id, 'lead_processed', 'warning', `Duplicate lead: ${existingLead.id}`, payload);
                return {
                    success: true,
                    leadId: existingLead.id,
                    message: 'Lead already exists',
                };
            }
            const lead = await this.createLeadFromWebhook(normalizedData, connector);
            webhookPayloadRecord.status = 'processed';
            webhookPayloadRecord.leadId = lead.id;
            await this.webhookPayloadRepository.save(webhookPayloadRecord);
            connector.lastSyncAt = new Date();
            connector.status = enums_1.ConnectorStatus.CONNECTED;
            await this.connectorRepository.save(connector);
            await this.createLog(connector.id, 'lead_processed', 'success', `Lead created: ${lead.id}`, payload, { leadId: lead.id });
            this.logger.log(`Lead processed for connector ${connector.id}, lead created: ${lead.id}`);
            return {
                success: true,
                leadId: lead.id,
                message: 'Lead created successfully',
            };
        }
        catch (error) {
            webhookPayloadRecord.status = 'failed';
            webhookPayloadRecord.errorMessage = error.message;
            await this.webhookPayloadRepository.save(webhookPayloadRecord);
            connector.lastError = error.message;
            await this.connectorRepository.save(connector);
            await this.createLog(connector.id, 'lead_processed', 'error', error.message, payload);
            this.logger.error(`Lead processing failed for connector ${connector.id}: ${error.message}`);
            return { success: false, message: error.message };
        }
    }
    async testWebhook(id, payload, currentUser) {
        const connector = await this.connectorRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!connector) {
            throw new common_1.NotFoundException(`Connector with ID ${id} not found`);
        }
        try {
            const normalizedData = this.normalizePayload(payload, connector.fieldMapping);
            await this.createLog(id, 'test_webhook', 'info', 'Test webhook processed', payload, normalizedData);
            return {
                success: true,
                normalizedData,
                message: 'Payload normalized successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                normalizedData: {},
                message: error.message,
            };
        }
    }
    async getLogs(filters) {
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
    async getOAuthUrl(type, connectorId) {
        const baseUrls = {
            [enums_1.ConnectorType.META]: 'https://www.facebook.com/v18.0/dialog/oauth',
            [enums_1.ConnectorType.GOOGLE]: 'https://accounts.google.com/o/oauth2/v2/auth',
            [enums_1.ConnectorType.LINKEDIN]: 'https://www.linkedin.com/oauth/v2/authorization',
        };
        const scopes = {
            [enums_1.ConnectorType.META]: 'leads_retrieval,pages_show_list,pages_read_engagement',
            [enums_1.ConnectorType.GOOGLE]: 'https://www.googleapis.com/auth/adwords',
            [enums_1.ConnectorType.LINKEDIN]: 'r_liteprofile,r_emailaddress,w_member_social',
        };
        const clientIds = {
            [enums_1.ConnectorType.META]: process.env.META_CLIENT_ID || '',
            [enums_1.ConnectorType.GOOGLE]: process.env.GOOGLE_CLIENT_ID || '',
            [enums_1.ConnectorType.LINKEDIN]: process.env.LINKEDIN_CLIENT_ID || '',
        };
        const redirectUri = `${process.env.API_BASE_URL}/api/connectors/oauth/callback`;
        const state = Buffer.from(JSON.stringify({ connectorId, type })).toString('base64');
        const params = new URLSearchParams({
            client_id: clientIds[type],
            redirect_uri: redirectUri,
            scope: scopes[type],
            response_type: 'code',
            state,
        });
        return `${baseUrls[type]}?${params.toString()}`;
    }
    async handleOAuthCallback(code, state) {
        try {
            const { connectorId, type } = JSON.parse(Buffer.from(state, 'base64').toString());
            const connector = await this.connectorRepository.findOne({
                where: { id: connectorId, deletedAt: (0, typeorm_2.IsNull)() },
            });
            if (!connector) {
                return {
                    success: false,
                    connectorId: '',
                    message: 'Connector not found',
                };
            }
            const tokens = await this.exchangeCodeForTokens(code, type);
            connector.oauthAccessToken = this.encryptToken(tokens.accessToken);
            connector.oauthRefreshToken = tokens.refreshToken
                ? this.encryptToken(tokens.refreshToken)
                : '';
            connector.oauthExpiresAt = tokens.expiresAt;
            connector.oauthScope = tokens.scope;
            connector.status = enums_1.ConnectorStatus.CONNECTED;
            await this.connectorRepository.save(connector);
            await this.createLog(connectorId, 'oauth_connected', 'success', 'OAuth authentication successful');
            return { success: true, connectorId, message: 'Connected successfully' };
        }
        catch (error) {
            this.logger.error(`OAuth callback failed: ${error.message}`);
            return { success: false, connectorId: '', message: error.message };
        }
    }
    checkPermission(user, action) {
        if (user.role !== enums_1.UserRole.ADMIN && user.role !== enums_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException(`Only Admin and Manager can ${action} connectors`);
        }
    }
    generateWebhookSecret() {
        return crypto.randomBytes(32).toString('hex');
    }
    validateWebhookSignature(payload, signature, secret) {
        if (!signature)
            return false;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature.replace('sha256=', '')), Buffer.from(expectedSignature));
    }
    normalizePayload(payload, fieldMapping) {
        const normalized = {};
        for (const [sourcePath, targetField] of Object.entries(fieldMapping)) {
            const value = this.getNestedValue(payload, sourcePath);
            if (value !== undefined && value !== null && value !== '') {
                normalized[targetField] = value;
            }
        }
        if (normalized.phoneNumber) {
            normalized.phoneNumber = this.normalizePhoneNumber(normalized.phoneNumber);
        }
        if (normalized.firstName || normalized.lastName) {
            normalized.name = [normalized.firstName, normalized.lastName]
                .filter(Boolean)
                .join(' ');
            delete normalized.firstName;
            delete normalized.lastName;
        }
        return normalized;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    normalizePhoneNumber(phone) {
        let normalized = phone.replace(/[^\d+]/g, '');
        if (!normalized.startsWith('+')) {
            if (normalized.length === 10) {
                normalized = '+91' + normalized;
            }
            else {
                normalized = '+' + normalized;
            }
        }
        return normalized;
    }
    async createLeadFromWebhook(data, connector) {
        const { LeadStatusMaster } = await Promise.resolve().then(() => require('../entities'));
        const statusMasterRepo = this.leadRepository.manager.getRepository(LeadStatusMaster);
        const newStatus = await statusMasterRepo.findOne({
            where: { name: 'New', isActive: true },
        });
        const lead = this.leadRepository.create({
            phoneNumber: data.phoneNumber,
            name: data.name || `Lead from ${connector.name}`,
            email: data.email,
            source: data.source || connector.name,
            status: enums_1.LeadStatus.NEW,
            statusMasterId: newStatus?.id,
        });
        return this.leadRepository.save(lead);
    }
    maskSensitiveData(connector) {
        const masked = { ...connector };
        if (masked.oauthAccessToken)
            masked.oauthAccessToken = '***ENCRYPTED***';
        if (masked.oauthRefreshToken)
            masked.oauthRefreshToken = '***ENCRYPTED***';
        if (masked.webhookSecret)
            masked.webhookSecret = masked.webhookSecret.substring(0, 8) + '...';
        return masked;
    }
    encryptToken(token) {
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long!!!!'), crypto.randomBytes(16));
        return cipher.update(token, 'utf8', 'hex') + cipher.final('hex');
    }
    async validateOAuthToken(connector) {
        if (!connector.oauthExpiresAt)
            return false;
        return new Date() < connector.oauthExpiresAt;
    }
    async exchangeCodeForTokens(code, type) {
        return {
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            expiresAt: new Date(Date.now() + 3600000),
            scope: 'read,write',
        };
    }
    async createLog(connectorId, action, level, message, rawPayload, processedData) {
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
};
exports.ConnectorService = ConnectorService;
exports.ConnectorService = ConnectorService = ConnectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Connector)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ConnectorLog)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.WebhookPayload)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ConnectorService);
//# sourceMappingURL=connector.service.js.map