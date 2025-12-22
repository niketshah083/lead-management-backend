import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDate,
  IsEnum,
} from 'class-validator';
import { MessageDirection, MessageStatus, MediaType } from '../enums';
import { UserDto } from './user.dto';

export class MessageDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsUUID()
  leadId: string;

  @Expose()
  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @Expose()
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType;

  @Expose()
  @IsOptional()
  @IsUUID()
  sentById?: string;

  @Expose()
  @Type(() => UserDto)
  @IsOptional()
  sentBy?: UserDto;

  @Expose()
  @IsEnum(MessageStatus)
  status: MessageStatus;

  @Expose()
  @IsBoolean()
  isAutoReply: boolean;

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;
}

export class SendMessageDto {
  @IsString()
  content: string;
}
