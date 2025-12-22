import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConnectorService } from './connector.service';
import {
  CreateConnectorDto,
  UpdateConnectorDto,
  ConnectorFieldMappingDto,
  ConnectorFilterDto,
  ConnectorLogFilterDto,
  TestWebhookDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../entities';
import { ConnectorType } from '../common/enums';
import { Public } from '../auth/decorators/public.decorator';

@Controller('connectors')
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}

  // ============ Static Routes (MUST come before :id routes) ============

  @Get('types')
  @UseGuards(JwtAuthGuard)
  async getConnectorTypes() {
    return {
      types: [
        {
          type: ConnectorType.WEBHOOK,
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
          type: ConnectorType.META,
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
          type: ConnectorType.GOOGLE,
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
          type: ConnectorType.YOUTUBE,
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
          type: ConnectorType.LINKEDIN,
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
          type: ConnectorType.WHATSAPP,
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
          type: ConnectorType.INDIAMART,
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
          type: ConnectorType.TRADEINDIA,
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

  @Get('field-options')
  @UseGuards(JwtAuthGuard)
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

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async getLogs(@Query() filters: ConnectorLogFilterDto) {
    return this.connectorService.getLogs(filters);
  }

  // ============ OAuth Endpoints (before :id routes) ============

  @Get('oauth/authorize/:type')
  @UseGuards(JwtAuthGuard)
  async getOAuthUrl(
    @Param('type') type: ConnectorType,
    @Query('connectorId') connectorId: string,
  ) {
    const url = await this.connectorService.getOAuthUrl(type, connectorId);
    return { url };
  }

  @Get('oauth/callback')
  @Public()
  async handleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const result = await this.connectorService.handleOAuthCallback(code, state);

    // Redirect to frontend with result
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const redirectUrl = result.success
      ? `${frontendUrl}/connectors/${result.connectorId}?connected=true`
      : `${frontendUrl}/connectors?error=${encodeURIComponent(result.message)}`;

    return res.redirect(redirectUrl);
  }

  // ============ Webhook Endpoints (Public, before :id routes) ============

  @Post('webhook/:webhookId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Param('webhookId') webhookId: string,
    @Body() payload: Record<string, any>,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    return this.connectorService.processWebhook(
      webhookId,
      payload,
      headers,
      ipAddress,
    );
  }

  // Meta/Facebook webhook verification
  @Get('webhook/:webhookId')
  @Public()
  async verifyWebhook(
    @Param('webhookId') webhookId: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    // For Meta webhook verification
    if (mode === 'subscribe' && verifyToken) {
      // In production, verify the token matches the connector's secret
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  // ============ IndiaMART Webhook Endpoint ============

  @Post('indiamart/:webhookId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveIndiamartWebhook(
    @Param('webhookId') webhookId: string,
    @Body() payload: Record<string, any>,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    return this.connectorService.processIndiamartWebhook(
      webhookId,
      payload,
      headers,
      ipAddress,
    );
  }

  // ============ TradeIndia Manual Sync Endpoint ============

  @Post(':id/sync-tradeindia')
  @UseGuards(JwtAuthGuard)
  async syncTradeIndia(@Param('id') id: string, @CurrentUser() user: User) {
    return this.connectorService.syncTradeIndiaLeads(id, user);
  }

  // ============ CRUD Routes ============

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateConnectorDto, @CurrentUser() user: User) {
    return this.connectorService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() filters: ConnectorFilterDto,
    @CurrentUser() user: User,
  ) {
    return this.connectorService.findAll(filters, user);
  }

  // ============ Dynamic :id Routes (MUST come last) ============

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.connectorService.findOne(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateConnectorDto,
    @CurrentUser() user: User,
  ) {
    return this.connectorService.update(id, dto, user);
  }

  @Put(':id/field-mapping')
  @UseGuards(JwtAuthGuard)
  async updateFieldMapping(
    @Param('id') id: string,
    @Body() dto: ConnectorFieldMappingDto,
    @CurrentUser() user: User,
  ) {
    return this.connectorService.updateFieldMapping(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.connectorService.delete(id, user);
    return { message: 'Connector deleted successfully' };
  }

  @Post(':id/test-connection')
  @UseGuards(JwtAuthGuard)
  async testConnection(@Param('id') id: string, @CurrentUser() user: User) {
    return this.connectorService.testConnection(id, user);
  }

  @Post(':id/test-webhook')
  @UseGuards(JwtAuthGuard)
  async testWebhook(
    @Param('id') id: string,
    @Body() dto: TestWebhookDto,
    @CurrentUser() user: User,
  ) {
    return this.connectorService.testWebhook(id, dto.payload, user);
  }

  @Post(':id/regenerate-secret')
  @UseGuards(JwtAuthGuard)
  async regenerateSecret(@Param('id') id: string, @CurrentUser() user: User) {
    return this.connectorService.regenerateWebhookSecret(id, user);
  }

  @Get(':id/logs')
  @UseGuards(JwtAuthGuard)
  async getConnectorLogs(
    @Param('id') id: string,
    @Query() filters: ConnectorLogFilterDto,
  ) {
    return this.connectorService.getLogs({ ...filters, connectorId: id });
  }
}
