import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { LeadStatus } from '../../common/enums';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  businessTypeId?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsBoolean()
  isQualified?: boolean;
}

export class UpdateStatusDto {
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReassignLeadDto {
  @IsUUID()
  assignedToId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
