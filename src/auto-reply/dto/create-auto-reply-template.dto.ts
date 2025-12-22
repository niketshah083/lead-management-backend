import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateAutoReplyTemplateDto {
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  triggerKeyword: string;

  @IsString()
  @IsNotEmpty()
  messageContent: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
