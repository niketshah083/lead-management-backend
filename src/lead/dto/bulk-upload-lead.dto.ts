import { IsString, IsOptional, IsDateString } from 'class-validator';

export class BulkUploadLeadDto {
  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkUploadResponseDto {
  successful: number;
  failed: number;
  errors: { row: number; error: string }[];
}
