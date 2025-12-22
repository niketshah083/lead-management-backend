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
exports.ConnectorController = void 0;
const common_1 = require("@nestjs/common");
const connector_service_1 = require("./connector.service");
const dto_1 = require("./dto");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let ConnectorController = class ConnectorController {
    connectorService;
    constructor(connectorService) {
        this.connectorService = connectorService;
    }
    async getConnectorTypes() {
        return {
            types: [
                {
                    type: enums_1.ConnectorType.WEBHOOK,
                    name: 'Custom Webhook',
                    description: 'Receive leads from any external system via HTTP POST',
                    icon: 'pi-link',
                    authType: 'webhook',
                    configFields: [
                        {
                            key: 'signatureHeader',
                            label: 'Signature Header Name',
                            type: 'text',
                            placeholder: 'X-Webhook-Signature',
                            hint: 'Header name containing the HMAC signature',
                            required: false,
                            defaultValue: 'X-Webhook-Signature',
                        },
                        {
                            key: 'signatureAlgorithm',
                            label: 'Signature Algorithm',
                            type: 'select',
                            options: [
                                { label: 'HMAC-SHA256', value: 'sha256' },
                                { label: 'HMAC-SHA1', value: 'sha1' },
                                { label: 'None', value: 'none' },
                            ],
                            required: false,
                            defaultValue: 'sha256',
                        },
                        {
                            key: 'allowedIps',
                            label: 'Allowed IP Addresses',
                            type: 'textarea',
                            placeholder: '192.168.1.1\n10.0.0.0/24',
                            hint: 'One IP or CIDR per line. Leave empty to allow all.',
                            required: false,
                        },
                    ],
                    defaultFieldMapping: {
                        phone: 'phoneNumber',
                        name: 'name',
                        email: 'email',
                        source: 'source',
                    },
                },
                {
                    type: enums_1.ConnectorType.META,
                    name: 'Meta (Facebook & Instagram)',
                    description: 'Import leads from Facebook Lead Ads and Instagram',
                    icon: 'pi-facebook',
                    authType: 'oauth',
                    oauthConfig: {
                        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
                        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
                        scopes: [
                            'leads_retrieval',
                            'pages_show_list',
                            'pages_read_engagement',
                            'ads_read',
                        ],
                    },
                    configFields: [
                        {
                            key: 'appId',
                            label: 'Facebook App ID',
                            type: 'text',
                            placeholder: 'Enter your Facebook App ID',
                            hint: 'Get this from developers.facebook.com',
                            required: true,
                        },
                        {
                            key: 'appSecret',
                            label: 'Facebook App Secret',
                            type: 'password',
                            placeholder: 'Enter your Facebook App Secret',
                            hint: 'Keep this secure, never share publicly',
                            required: true,
                        },
                        {
                            key: 'pageId',
                            label: 'Facebook Page ID',
                            type: 'text',
                            placeholder: 'Select after connecting',
                            hint: 'Will be populated after OAuth connection',
                            required: false,
                            readOnly: true,
                        },
                        {
                            key: 'adAccountId',
                            label: 'Ad Account ID',
                            type: 'text',
                            placeholder: 'act_XXXXXXXXX',
                            hint: 'Your Facebook Ads account ID',
                            required: false,
                        },
                        {
                            key: 'webhookVerifyToken',
                            label: 'Webhook Verify Token',
                            type: 'text',
                            placeholder: 'Auto-generated',
                            hint: 'Use this in Facebook webhook settings',
                            required: false,
                            readOnly: true,
                        },
                    ],
                    defaultFieldMapping: {
                        'field_data.phone_number': 'phoneNumber',
                        'field_data.full_name': 'name',
                        'field_data.email': 'email',
                        ad_name: 'source',
                        campaign_name: 'campaign',
                        'field_data.company': 'businessName',
                        'field_data.city': 'city',
                        'field_data.state': 'state',
                    },
                },
                {
                    type: enums_1.ConnectorType.GOOGLE,
                    name: 'Google Ads',
                    description: 'Import leads from Google Ads Lead Form Extensions',
                    icon: 'pi-google',
                    authType: 'oauth',
                    oauthConfig: {
                        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                        tokenUrl: 'https://oauth2.googleapis.com/token',
                        scopes: ['https://www.googleapis.com/auth/adwords'],
                    },
                    configFields: [
                        {
                            key: 'clientId',
                            label: 'Google Client ID',
                            type: 'text',
                            placeholder: 'XXXXXX.apps.googleusercontent.com',
                            hint: 'Get this from Google Cloud Console',
                            required: true,
                        },
                        {
                            key: 'clientSecret',
                            label: 'Google Client Secret',
                            type: 'password',
                            placeholder: 'Enter your Client Secret',
                            hint: 'Keep this secure',
                            required: true,
                        },
                        {
                            key: 'developerToken',
                            label: 'Developer Token',
                            type: 'password',
                            placeholder: 'Enter your Google Ads Developer Token',
                            hint: 'Required for Google Ads API access',
                            required: true,
                        },
                        {
                            key: 'customerId',
                            label: 'Customer ID',
                            type: 'text',
                            placeholder: 'XXX-XXX-XXXX',
                            hint: 'Your Google Ads Customer ID (without dashes)',
                            required: true,
                        },
                        {
                            key: 'loginCustomerId',
                            label: 'Manager Account ID (Optional)',
                            type: 'text',
                            placeholder: 'XXX-XXX-XXXX',
                            hint: 'If using a manager account',
                            required: false,
                        },
                    ],
                    defaultFieldMapping: {
                        'user_column_data.PHONE_NUMBER': 'phoneNumber',
                        'user_column_data.FULL_NAME': 'name',
                        'user_column_data.EMAIL': 'email',
                        'user_column_data.COMPANY_NAME': 'businessName',
                        'user_column_data.CITY': 'city',
                        'user_column_data.POSTAL_CODE': 'pincode',
                        campaign_id: 'source',
                    },
                },
                {
                    type: enums_1.ConnectorType.YOUTUBE,
                    name: 'YouTube',
                    description: 'Import leads from YouTube channel interactions',
                    icon: 'pi-youtube',
                    authType: 'oauth',
                    oauthConfig: {
                        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                        tokenUrl: 'https://oauth2.googleapis.com/token',
                        scopes: [
                            'https://www.googleapis.com/auth/youtube.readonly',
                            'https://www.googleapis.com/auth/youtube.force-ssl',
                        ],
                    },
                    configFields: [
                        {
                            key: 'clientId',
                            label: 'Google Client ID',
                            type: 'text',
                            placeholder: 'XXXXXX.apps.googleusercontent.com',
                            hint: 'Same as Google Ads if already configured',
                            required: true,
                        },
                        {
                            key: 'clientSecret',
                            label: 'Google Client Secret',
                            type: 'password',
                            placeholder: 'Enter your Client Secret',
                            required: true,
                        },
                        {
                            key: 'channelId',
                            label: 'YouTube Channel ID',
                            type: 'text',
                            placeholder: 'UC...',
                            hint: 'Will be auto-populated after connection',
                            required: false,
                            readOnly: true,
                        },
                        {
                            key: 'captureComments',
                            label: 'Capture Comments as Leads',
                            type: 'toggle',
                            hint: 'Create leads from video comments',
                            required: false,
                            defaultValue: false,
                        },
                        {
                            key: 'captureSubscribers',
                            label: 'Capture New Subscribers',
                            type: 'toggle',
                            hint: 'Create leads from new subscribers',
                            required: false,
                            defaultValue: true,
                        },
                    ],
                    defaultFieldMapping: {
                        'snippet.channelId': 'externalId',
                        'snippet.title': 'name',
                        'snippet.description': 'notes',
                    },
                },
                {
                    type: enums_1.ConnectorType.LINKEDIN,
                    name: 'LinkedIn',
                    description: 'Import leads from LinkedIn Lead Gen Forms',
                    icon: 'pi-linkedin',
                    authType: 'oauth',
                    oauthConfig: {
                        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
                        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
                        scopes: [
                            'r_liteprofile',
                            'r_emailaddress',
                            'r_ads',
                            'r_ads_leadgen_automation',
                        ],
                    },
                    configFields: [
                        {
                            key: 'clientId',
                            label: 'LinkedIn Client ID',
                            type: 'text',
                            placeholder: 'Enter your LinkedIn App Client ID',
                            hint: 'Get this from LinkedIn Developer Portal',
                            required: true,
                        },
                        {
                            key: 'clientSecret',
                            label: 'LinkedIn Client Secret',
                            type: 'password',
                            placeholder: 'Enter your Client Secret',
                            required: true,
                        },
                        {
                            key: 'adAccountId',
                            label: 'Ad Account ID',
                            type: 'text',
                            placeholder: 'urn:li:sponsoredAccount:XXXXXXX',
                            hint: 'Your LinkedIn Ads account URN',
                            required: true,
                        },
                        {
                            key: 'organizationId',
                            label: 'Organization ID',
                            type: 'text',
                            placeholder: 'urn:li:organization:XXXXXXX',
                            hint: 'Your LinkedIn Company Page URN',
                            required: false,
                        },
                    ],
                    defaultFieldMapping: {
                        'formResponse.answers.phoneNumber': 'phoneNumber',
                        'formResponse.answers.firstName': 'firstName',
                        'formResponse.answers.lastName': 'lastName',
                        'formResponse.answers.email': 'email',
                        'formResponse.answers.companyName': 'businessName',
                        'formResponse.answers.jobTitle': 'designation',
                        'campaign.name': 'source',
                    },
                },
                {
                    type: enums_1.ConnectorType.WHATSAPP,
                    name: 'WhatsApp Business',
                    description: 'Connect with WhatsApp Business API for messaging',
                    icon: 'pi-whatsapp',
                    authType: 'api_key',
                    configFields: [
                        {
                            key: 'phoneNumberId',
                            label: 'Phone Number ID',
                            type: 'text',
                            placeholder: 'Enter WhatsApp Phone Number ID',
                            hint: 'From Meta Business Suite > WhatsApp',
                            required: true,
                        },
                        {
                            key: 'businessAccountId',
                            label: 'Business Account ID',
                            type: 'text',
                            placeholder: 'Enter WhatsApp Business Account ID',
                            hint: 'Your WABA ID from Meta Business Suite',
                            required: true,
                        },
                        {
                            key: 'accessToken',
                            label: 'Permanent Access Token',
                            type: 'password',
                            placeholder: 'Enter your permanent access token',
                            hint: 'Generate from Meta Business Suite',
                            required: true,
                        },
                        {
                            key: 'webhookVerifyToken',
                            label: 'Webhook Verify Token',
                            type: 'text',
                            placeholder: 'Auto-generated',
                            hint: 'Use this in Meta webhook settings',
                            required: false,
                            readOnly: true,
                        },
                        {
                            key: 'apiVersion',
                            label: 'API Version',
                            type: 'select',
                            options: [
                                { label: 'v18.0', value: 'v18.0' },
                                { label: 'v17.0', value: 'v17.0' },
                                { label: 'v16.0', value: 'v16.0' },
                            ],
                            required: false,
                            defaultValue: 'v18.0',
                        },
                    ],
                    defaultFieldMapping: {
                        from: 'phoneNumber',
                        'profile.name': 'name',
                        'context.from': 'referredBy',
                    },
                },
                {
                    type: enums_1.ConnectorType.INDIAMART,
                    name: 'IndiaMART',
                    description: 'Import buyer inquiries from IndiaMART Lead Manager',
                    icon: 'pi-shopping-cart',
                    authType: 'webhook',
                    configFields: [
                        {
                            key: 'glid',
                            label: 'GLID (Global Lead ID)',
                            type: 'text',
                            placeholder: 'Enter your IndiaMART GLID',
                            hint: 'Your unique IndiaMART seller ID (GLID)',
                            required: true,
                        },
                        {
                            key: 'mobileKey',
                            label: 'Mobile Key',
                            type: 'password',
                            placeholder: 'Enter your Mobile Key',
                            hint: 'Authentication key from IndiaMART Lead Manager',
                            required: true,
                        },
                        {
                            key: 'enablePullApi',
                            label: 'Enable Pull API (Fallback)',
                            type: 'toggle',
                            hint: 'Fetch leads periodically as backup to Push API',
                            required: false,
                            defaultValue: false,
                        },
                        {
                            key: 'pullIntervalMinutes',
                            label: 'Pull Interval (Minutes)',
                            type: 'select',
                            options: [
                                { label: '5 minutes', value: '5' },
                                { label: '15 minutes', value: '15' },
                                { label: '30 minutes', value: '30' },
                                { label: '60 minutes', value: '60' },
                            ],
                            hint: 'How often to fetch leads via Pull API',
                            required: false,
                            defaultValue: '15',
                        },
                        {
                            key: 'webhookVerifyToken',
                            label: 'Webhook Verify Token',
                            type: 'text',
                            placeholder: 'Auto-generated',
                            hint: 'Use this token in IndiaMART Push API settings',
                            required: false,
                            readOnly: true,
                        },
                    ],
                    defaultFieldMapping: {
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
                },
                {
                    type: enums_1.ConnectorType.TRADEINDIA,
                    name: 'TradeIndia',
                    description: 'Import buyer inquiries from TradeIndia marketplace',
                    icon: 'pi-globe',
                    authType: 'api_key',
                    configFields: [
                        {
                            key: 'userId',
                            label: 'User ID',
                            type: 'text',
                            placeholder: 'Enter your TradeIndia User ID',
                            hint: 'Your TradeIndia seller account User ID',
                            required: true,
                        },
                        {
                            key: 'profileId',
                            label: 'Profile ID',
                            type: 'text',
                            placeholder: 'Enter your Profile ID',
                            hint: 'Your TradeIndia Profile ID',
                            required: true,
                        },
                        {
                            key: 'apiKey',
                            label: 'API Key',
                            type: 'password',
                            placeholder: 'Enter your TradeIndia API Key',
                            hint: 'Generate from TradeIndia seller dashboard',
                            required: true,
                        },
                        {
                            key: 'syncIntervalMinutes',
                            label: 'Sync Interval',
                            type: 'select',
                            options: [
                                { label: '5 minutes', value: '5' },
                                { label: '15 minutes', value: '15' },
                                { label: '30 minutes', value: '30' },
                                { label: '60 minutes', value: '60' },
                                { label: '2 hours', value: '120' },
                            ],
                            hint: 'How often to fetch new inquiries',
                            required: false,
                            defaultValue: '15',
                        },
                        {
                            key: 'lastSyncTime',
                            label: 'Last Sync Time',
                            type: 'text',
                            placeholder: 'Auto-updated',
                            hint: 'Last successful sync timestamp',
                            required: false,
                            readOnly: true,
                        },
                    ],
                    defaultFieldMapping: {
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
                },
            ],
        };
    }
    async getFieldOptions() {
        return {
            leadFields: [
                { value: 'phoneNumber', label: 'Phone Number', required: true },
                { value: 'name', label: 'Name', required: false },
                { value: 'email', label: 'Email', required: false },
                { value: 'source', label: 'Source', required: false },
                { value: 'businessName', label: 'Business Name', required: false },
                { value: 'addressLine1', label: 'Address Line 1', required: false },
                { value: 'addressLine2', label: 'Address Line 2', required: false },
                { value: 'city', label: 'City', required: false },
                { value: 'state', label: 'State', required: false },
                { value: 'country', label: 'Country', required: false },
                { value: 'pincode', label: 'Pincode', required: false },
            ],
        };
    }
    async getLogs(filters) {
        return this.connectorService.getLogs(filters);
    }
    async getOAuthUrl(type, connectorId) {
        const url = await this.connectorService.getOAuthUrl(type, connectorId);
        return { url };
    }
    async handleOAuthCallback(code, state, res) {
        const result = await this.connectorService.handleOAuthCallback(code, state);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        const redirectUrl = result.success
            ? `${frontendUrl}/connectors/${result.connectorId}?connected=true`
            : `${frontendUrl}/connectors?error=${encodeURIComponent(result.message)}`;
        return res.redirect(redirectUrl);
    }
    async receiveWebhook(webhookId, payload, headers, req) {
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        return this.connectorService.processWebhook(webhookId, payload, headers, ipAddress);
    }
    async verifyWebhook(webhookId, mode, verifyToken, challenge, res) {
        if (mode === 'subscribe' && verifyToken) {
            return res.status(200).send(challenge);
        }
        return res.status(403).send('Forbidden');
    }
    async receiveIndiamartWebhook(webhookId, payload, headers, req) {
        const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
        return this.connectorService.processIndiamartWebhook(webhookId, payload, headers, ipAddress);
    }
    async syncTradeIndia(id, user) {
        return this.connectorService.syncTradeIndiaLeads(id, user);
    }
    async create(dto, user) {
        return this.connectorService.create(dto, user);
    }
    async findAll(filters, user) {
        return this.connectorService.findAll(filters, user);
    }
    async findOne(id, user) {
        return this.connectorService.findOne(id, user);
    }
    async update(id, dto, user) {
        return this.connectorService.update(id, dto, user);
    }
    async updateFieldMapping(id, dto, user) {
        return this.connectorService.updateFieldMapping(id, dto, user);
    }
    async delete(id, user) {
        await this.connectorService.delete(id, user);
        return { message: 'Connector deleted successfully' };
    }
    async testConnection(id, user) {
        return this.connectorService.testConnection(id, user);
    }
    async testWebhook(id, dto, user) {
        return this.connectorService.testWebhook(id, dto.payload, user);
    }
    async regenerateSecret(id, user) {
        return this.connectorService.regenerateWebhookSecret(id, user);
    }
    async getConnectorLogs(id, filters) {
        return this.connectorService.getLogs({ ...filters, connectorId: id });
    }
};
exports.ConnectorController = ConnectorController;
__decorate([
    (0, common_1.Get)('types'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "getConnectorTypes", null);
__decorate([
    (0, common_1.Get)('field-options'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "getFieldOptions", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ConnectorLogFilterDto]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('oauth/authorize/:type'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)('connectorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "getOAuthUrl", null);
__decorate([
    (0, common_1.Get)('oauth/callback'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "handleOAuthCallback", null);
__decorate([
    (0, common_1.Post)('webhook/:webhookId'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('webhookId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "receiveWebhook", null);
__decorate([
    (0, common_1.Get)('webhook/:webhookId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('webhookId')),
    __param(1, (0, common_1.Query)('hub.mode')),
    __param(2, (0, common_1.Query)('hub.verify_token')),
    __param(3, (0, common_1.Query)('hub.challenge')),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('indiamart/:webhookId'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('webhookId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "receiveIndiamartWebhook", null);
__decorate([
    (0, common_1.Post)(':id/sync-tradeindia'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "syncTradeIndia", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateConnectorDto, entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ConnectorFilterDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateConnectorDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/field-mapping'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ConnectorFieldMappingDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "updateFieldMapping", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/test-connection'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)(':id/test-webhook'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.TestWebhookDto,
        entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "testWebhook", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-secret'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, entities_1.User]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "regenerateSecret", null);
__decorate([
    (0, common_1.Get)(':id/logs'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ConnectorLogFilterDto]),
    __metadata("design:returntype", Promise)
], ConnectorController.prototype, "getConnectorLogs", null);
exports.ConnectorController = ConnectorController = __decorate([
    (0, common_1.Controller)('connectors'),
    __metadata("design:paramtypes", [connector_service_1.ConnectorService])
], ConnectorController);
//# sourceMappingURL=connector.controller.js.map