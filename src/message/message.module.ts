import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Message, Lead, Category, User, UserCategory } from '../entities';
import {
  SqsConsumerService,
  CategoryDetectorService,
  MessageService,
} from './services';
import { MessageController } from './message.controller';
import { ChatGateway } from './gateways';
import { AutoReplyModule } from '../auto-reply/auto-reply.module';
import { SlaModule } from '../sla/sla.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Message, Lead, Category, User, UserCategory]),
    forwardRef(() => AutoReplyModule),
    forwardRef(() => SlaModule),
    CommonModule,
  ],
  controllers: [MessageController],
  providers: [
    SqsConsumerService,
    CategoryDetectorService,
    MessageService,
    ChatGateway,
  ],
  exports: [
    SqsConsumerService,
    CategoryDetectorService,
    MessageService,
    ChatGateway,
  ],
})
export class MessageModule {}
