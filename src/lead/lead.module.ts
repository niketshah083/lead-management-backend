import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Lead,
  LeadHistory,
  LeadContact,
  Message,
  User,
  LeadCustomField,
  BusinessType,
  FieldDefinition,
} from '../entities';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';
import { LeadVisibilityService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      LeadHistory,
      LeadContact,
      Message,
      User,
      LeadCustomField,
      BusinessType,
      FieldDefinition,
    ]),
  ],
  controllers: [LeadController],
  providers: [LeadService, LeadVisibilityService],
  exports: [LeadService, LeadVisibilityService],
})
export class LeadModule {}
