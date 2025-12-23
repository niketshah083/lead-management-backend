import { IsString, IsOptional, IsObject } from 'class-validator';

export class ConnectorFieldMappingDto {
  @IsObject()
  fieldMapping: Record<string, string>;
}

export class OAuthCallbackDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class TestWebhookDto {
  @IsObject()
  payload: Record<string, any>;
}

export class WebhookPayloadDto {
  // Dynamic payload - validated at runtime
  [key: string]: any;
}
