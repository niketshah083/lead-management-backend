import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User, NotificationConfig, NotificationLog } from '../entities';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, NotificationConfig, NotificationLog]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
