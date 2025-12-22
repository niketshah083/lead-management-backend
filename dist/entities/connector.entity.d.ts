import { ConnectorType, ConnectorStatus } from '../common/enums';
import { User } from './user.entity';
export declare class Connector {
    id: string;
    name: string;
    type: ConnectorType;
    status: ConnectorStatus;
    description: string;
    webhookUrl: string;
    webhookSecret: string;
    oauthAccessToken: string;
    oauthRefreshToken: string;
    oauthExpiresAt: Date;
    oauthScope: string;
    externalAccountId: string;
    externalAccountName: string;
    externalPageId: string;
    externalPageName: string;
    config: Record<string, any>;
    fieldMapping: Record<string, string>;
    isActive: boolean;
    lastSyncAt: Date;
    lastError: string;
    syncIntervalMinutes: number;
    createdById: string;
    createdBy: User;
    logs: ConnectorLog[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
export declare class ConnectorLog {
    id: string;
    connectorId: string;
    connector: Connector;
    action: string;
    level: 'success' | 'error' | 'warning' | 'info';
    message: string;
    rawPayload: Record<string, any>;
    processedData: Record<string, any>;
    leadId: string;
    errorDetails: string;
    ipAddress: string;
    createdAt: Date;
}
export declare class WebhookPayload {
    id: string;
    connectorId: string;
    connector: Connector;
    rawPayload: Record<string, any>;
    normalizedData: Record<string, any>;
    status: 'pending' | 'processed' | 'failed' | 'duplicate';
    leadId: string;
    errorMessage: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    processedAt: Date;
}
