import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateSlaPolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  firstResponseMinutes: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  followUpMinutes?: number;

  @IsNumber()
  @Min(1)
  resolutionMinutes: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  warningThresholdPercent?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
