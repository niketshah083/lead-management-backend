import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateLeadStatusDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  bgColor?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @IsOptional()
  @IsString()
  statusType?: string;
}

export class UpdateLeadStatusDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  bgColor?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isInitial?: boolean;

  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @IsOptional()
  @IsString()
  statusType?: string;
}

// Status Transition DTOs
export class CreateStatusTransitionDto {
  @IsUUID()
  fromStatusId: string;

  @IsUUID()
  toStatusId: string;

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}

export class UpdateStatusTransitionDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}

export class BulkCreateTransitionsDto {
  @IsUUID()
  fromStatusId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  toStatusIds: string[];

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;
}
