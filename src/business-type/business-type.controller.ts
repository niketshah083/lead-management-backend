import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { BusinessTypeService } from './business-type.service';
import {
  CreateBusinessTypeDto,
  UpdateBusinessTypeDto,
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
} from './dto';

@Controller('business-types')
export class BusinessTypeController {
  constructor(private readonly businessTypeService: BusinessTypeService) {}

  // ============ Business Type Endpoints ============

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    if (activeOnly === 'true') {
      return this.businessTypeService.findActiveBusinessTypes();
    }
    return this.businessTypeService.findAllBusinessTypes();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.businessTypeService.findOneBusinessType(id);
  }

  @Post()
  async create(@Body() dto: CreateBusinessTypeDto) {
    return this.businessTypeService.createBusinessType(dto);
  }

  @Put('reorder')
  async reorder(@Body() items: { id: string; order: number }[]) {
    await this.businessTypeService.reorderBusinessTypes(items);
    return { success: true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBusinessTypeDto) {
    return this.businessTypeService.updateBusinessType(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.businessTypeService.deleteBusinessType(id);
    return { success: true };
  }

  // ============ Field Definition Endpoints ============

  @Get(':businessTypeId/fields')
  async getFields(
    @Param('businessTypeId') businessTypeId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    if (activeOnly === 'true') {
      return this.businessTypeService.findActiveFieldsByBusinessType(
        businessTypeId,
      );
    }
    return this.businessTypeService.findFieldsByBusinessType(businessTypeId);
  }

  @Post(':businessTypeId/fields')
  async createField(
    @Param('businessTypeId') businessTypeId: string,
    @Body() dto: Omit<CreateFieldDefinitionDto, 'businessTypeId'>,
  ) {
    return this.businessTypeService.createFieldDefinition({
      ...dto,
      businessTypeId,
    } as CreateFieldDefinitionDto);
  }

  @Put(':businessTypeId/fields/reorder')
  async reorderFields(@Body() items: { id: string; order: number }[]) {
    await this.businessTypeService.reorderFields(items);
    return { success: true };
  }

  @Get('fields/:fieldId')
  async getField(@Param('fieldId') fieldId: string) {
    return this.businessTypeService.findOneFieldDefinition(fieldId);
  }

  @Put('fields/:fieldId')
  async updateField(
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateFieldDefinitionDto,
  ) {
    return this.businessTypeService.updateFieldDefinition(fieldId, dto);
  }

  @Delete('fields/:fieldId')
  async deleteField(@Param('fieldId') fieldId: string) {
    await this.businessTypeService.deleteFieldDefinition(fieldId);
    return { success: true };
  }
}
