import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from './services';
import { SendMessageDto, PaginationDto } from './dto';
import { S3Service } from '../common/services';
import { MediaType, MessageDirection, MessageStatus } from '../common/enums';
import { ChatGateway } from './gateways/chat.gateway';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly s3Service: S3Service,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('lead/:leadId')
  getConversation(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.messageService.getConversation(leadId, pagination);
  }

  @Post('lead/:leadId')
  send(
    @Param('leadId', ParseUUIDPipe) leadId: string,
    @Body() dto: SendMessageDto,
    @Request() req: any,
  ) {
    return this.messageService.send(leadId, dto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.messageService.findById(id);
  }

  @Post('test-notification/:leadId')
  async testNotification(@Param('leadId', ParseUUIDPipe) leadId: string) {
    // Create a test message
    const testMessage = {
      id: 'test-' + Date.now(),
      leadId,
      direction: MessageDirection.INBOUND,
      content: 'Test notification message from backend',
      status: MessageStatus.DELIVERED,
      isAutoReply: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Emit via WebSocket
    this.chatGateway.notifyNewMessage(leadId, testMessage as any);

    return { message: 'Test notification sent', leadId, testMessage };
  }

  /**
   * Upload media file for chat message
   * Returns the S3 signed URL to use in sendMessage
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Determine media type from mimetype
    let mediaType: MediaType;
    if (file.mimetype.startsWith('image/')) {
      mediaType = MediaType.IMAGE;
    } else if (file.mimetype.startsWith('video/')) {
      mediaType = MediaType.VIDEO;
    } else if (file.mimetype === 'application/pdf') {
      mediaType = MediaType.DOCUMENT;
    } else {
      throw new BadRequestException(
        'Invalid file type. Allowed: images, videos, PDF documents',
      );
    }

    // Upload to S3
    const folder = 'chat-media';
    const uploadResult = await this.s3Service.uploadFile(file, folder);

    return {
      url: uploadResult.signedUrl,
      key: uploadResult.key,
      mediaType,
      filename: file.originalname,
      size: file.size,
    };
  }
}
