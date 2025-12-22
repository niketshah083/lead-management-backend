import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class DashboardFilterDto {
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
