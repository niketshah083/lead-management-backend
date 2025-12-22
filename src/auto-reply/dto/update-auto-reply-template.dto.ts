import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateAutoReplyTemplateDto {
  @IsString()
  @IsOptional()
  triggerKeyword?: string;

  @IsString()
  @IsOptional()
  messageContent?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
