import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsUUID,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ConnectorType } from '../../common/enums';

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
