import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';

export class PushNotificationDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
