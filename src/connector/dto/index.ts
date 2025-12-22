import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsObject,
  IsNumber,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ConnectorType } from '../../common/enums';

export class CreateConnectorDto {
  @IsString()
  name: string;

  @IsEnum(ConnectorType)
  type: ConnectorType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  syncIntervalMinutes?: number;
}

export class UpdateConnectorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsObject()
  fieldMapping?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  syncIntervalMinutes?: number;
}

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

export class ConnectorFilterDto {
  @IsOptional()
  @IsEnum(ConnectorType)
  type?: ConnectorType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class ConnectorLogFilterDto {
  @IsOptional()
  @IsUUID()
  connectorId?: string;

  @IsOptional()
  @IsString()
  level?: 'success' | 'error' | 'warning' | 'info';

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
