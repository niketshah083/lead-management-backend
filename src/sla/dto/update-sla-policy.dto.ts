import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class UpdateSlaPolicyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  firstResponseMinutes?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  followUpMinutes?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  resolutionMinutes?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  warningThresholdPercent?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
