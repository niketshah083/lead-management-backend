import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

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
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  statusMasterId?: string;

  @IsOptional()
  @IsBoolean()
  isQualified?: boolean;
}

export class UpdateStatusDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  statusMasterId?: string;

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
