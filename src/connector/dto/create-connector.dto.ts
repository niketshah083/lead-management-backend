import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
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
