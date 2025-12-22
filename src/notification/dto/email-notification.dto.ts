import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';

export class EmailNotificationDto {
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}
