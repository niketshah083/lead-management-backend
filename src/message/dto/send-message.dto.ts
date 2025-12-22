import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { MediaType } from '../../common/enums';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsEnum(MediaType)
  @IsOptional()
  mediaType?: MediaType;
}
