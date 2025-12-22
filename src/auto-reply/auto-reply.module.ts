import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AutoReplyTemplate,
  Category,
  Message,
  Lead,
  CategoryMedia,
} from '../entities';
import { CommonModule } from '../common/common.module';
import { AutoReplyService } from './auto-reply.service';
import { AutoReplyController } from './auto-reply.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutoReplyTemplate,
      Category,
      Message,
      Lead,
      CategoryMedia,
    ]),
    CommonModule,
  ],
  controllers: [AutoReplyController],
  providers: [AutoReplyService],
  exports: [AutoReplyService],
})
export class AutoReplyModule {}
