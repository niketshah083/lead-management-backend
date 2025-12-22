import {
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LeadStatus } from '../../common/enums';

export class ReportFilterDto {
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsArray()
  @IsEnum(LeadStatus, { each: true })
  @IsOptional()
  status?: LeadStatus[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
