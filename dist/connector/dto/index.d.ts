import { ConnectorType } from '../../common/enums';
export declare class CreateConnectorDto {
    name: string;
    type: ConnectorType;
    description?: string;
    config?: Record<string, any>;
    fieldMapping?: Record<string, string>;
    syncIntervalMinutes?: number;
}
export declare class UpdateConnectorDto {
    name?: string;
    description?: string;
    config?: Record<string, any>;
    fieldMapping?: Record<string, string>;
    isActive?: boolean;
    syncIntervalMinutes?: number;
}
export declare class ConnectorFieldMappingDto {
    fieldMapping: Record<string, string>;
}
export declare class OAuthCallbackDto {
    code: string;
    state?: string;
}
export declare class TestWebhookDto {
    payload: Record<string, any>;
}
export declare class WebhookPayloadDto {
    [key: string]: any;
}
export declare class ConnectorFilterDto {
    type?: ConnectorType;
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class ConnectorLogFilterDto {
    connectorId?: string;
    level?: 'success' | 'error' | 'warning' | 'info';
    action?: string;
    page?: number;
    limit?: number;
}
