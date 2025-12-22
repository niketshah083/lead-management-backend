import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlaPolicy, SlaTracking, Lead } from '../entities';
import { SlaController } from './sla.controller';
import { SlaService } from './sla.service';
import { SlaSchedulerService } from './sla-scheduler.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlaPolicy, SlaTracking, Lead]),
    forwardRef(() => NotificationModule),
  ],
  controllers: [SlaController],
  providers: [SlaService, SlaSchedulerService],
  exports: [SlaService, SlaSchedulerService],
})
export class SlaModule {}
