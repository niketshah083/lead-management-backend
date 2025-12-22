import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { LeadStatus } from '../../common/enums';

export class CreateLeadDto {
  @IsString()
  phoneNumber: string;

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
}
