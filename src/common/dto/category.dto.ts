import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { MediaType } from '../enums';

export class MediaDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  url: string;

  @Expose()
  @IsOptional()
  @IsString()
  signedUrl?: string;

  @Expose()
  @IsEnum(MediaType)
  type: MediaType;

  @Expose()
  @IsString()
  filename: string;

  @Expose()
  @IsNumber()
  size: number;
}

export class AutoReplyTemplateDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  triggerKeyword: string;

  @Expose()
  @IsString()
  messageContent: string;

  @Expose()
  @IsNumber()
  priority: number;

  @Expose()
  @IsBoolean()
  isActive: boolean;
}

export class CategoryDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @Expose()
  @Type(() => MediaDto)
  @IsArray()
  @IsOptional()
  media?: MediaDto[];

  @Expose()
  @Type(() => AutoReplyTemplateDto)
  @IsArray()
  @IsOptional()
  autoReplyTemplates?: AutoReplyTemplateDto[];

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
