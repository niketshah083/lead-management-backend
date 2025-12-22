import { Repository } from 'typeorm';
import { Connector, ConnectorLog, WebhookPayload, Lead, User } from '../entities';
import { ConnectorType } from '../common/enums';
import { CreateConnectorDto, UpdateConnectorDto, ConnectorFieldMappingDto, ConnectorFilterDto, ConnectorLogFilterDto } from './dto';
export declare class ConnectorService {
    private readonly connectorRepository;
    private readonly connectorLogRepository;
    private readonly webhookPayloadRepository;
    private readonly leadRepository;
    private readonly userRepository;
    private readonly logger;
    private readonly defaultFieldMappings;
    constructor(connectorRepository: Repository<Connector>, connectorLogRepository: Repository<ConnectorLog>, webhookPayloadRepository: Repository<WebhookPayload>, leadRepository: Repository<Lead>, userRepository: Repository<User>);
    create(dto: CreateConnectorDto, currentUser: User): Promise<Connector>;
    findAll(filters: ConnectorFilterDto, currentUser: User): Promise<{
        items: Connector[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, currentUser: User): Promise<Connector>;
    update(id: string, dto: UpdateConnectorDto, currentUser: User): Promise<Connector>;
    updateFieldMapping(id: string, dto: ConnectorFieldMappingDto, currentUser: User): Promise<Connector>;
    delete(id: string, currentUser: User): Promise<void>;
    testConnection(id: string, currentUser: User): Promise<{
        success: boolean;
        message: string;
    }>;
    regenerateWebhookSecret(id: string, currentUser: User): Promise<{
        webhookSecret: string;
    }>;
    processWebhook(webhookId: string, payload: Record<string, any>, headers: Record<string, string>, ipAddress: string): Promise<{
        success: boolean;
        leadId?: string;
        message: string;
    }>;
    processIndiamartWebhook(webhookId: string, payload: Record<string, any>, headers: Record<string, string>, ipAddress: string): Promise<{
        success: boolean;
        leadId?: string;
        message: string;
    }>;
    private normalizeIndiamartPayload;
    syncTradeIndiaLeads(connectorId: string, currentUser: User): Promise<{
        success: boolean;
        message: string;
        leadsCreated: number;
        leadsDuplicate: number;
    }>;
    private fetchTradeIndiaLeads;
    private normalizeTradeIndiaPayload;
    private processIncomingLead;
    testWebhook(id: string, payload: Record<string, any>, currentUser: User): Promise<{
        success: boolean;
        normalizedData: Record<string, any>;
        message: string;
    }>;
    getLogs(filters: ConnectorLogFilterDto): Promise<{
        items: ConnectorLog[];
        total: number;
        page: number;
        limit: number;
    }>;
    getOAuthUrl(type: ConnectorType, connectorId: string): Promise<string>;
    handleOAuthCallback(code: string, state: string): Promise<{
        success: boolean;
        connectorId: string;
        message: string;
    }>;
    private checkPermission;
    private generateWebhookSecret;
    private validateWebhookSignature;
    private normalizePayload;
    private getNestedValue;
    private normalizePhoneNumber;
    private createLeadFromWebhook;
    private maskSensitiveData;
    private encryptToken;
    private validateOAuthToken;
    private exchangeCodeForTokens;
    private createLog;
}
