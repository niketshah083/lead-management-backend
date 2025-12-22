import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadStatusMaster, StatusTransition } from '../entities';
import { LeadStatusService } from './lead-status.service';
import { LeadStatusController } from './lead-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeadStatusMaster, StatusTransition])],
  controllers: [LeadStatusController],
  providers: [LeadStatusService],
  exports: [LeadStatusService],
})
export class LeadStatusModule {}
