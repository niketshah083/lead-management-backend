import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessType, FieldDefinition, LeadCustomField } from '../entities';
import { BusinessTypeController } from './business-type.controller';
import { BusinessTypeService } from './business-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessType, FieldDefinition, LeadCustomField]),
  ],
  controllers: [BusinessTypeController],
  providers: [BusinessTypeService],
  exports: [BusinessTypeService],
})
export class BusinessTypeModule {}
