import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LeadService } from './lead.service';
import { CurrentUser, Roles } from '../auth/decorators';
import { User } from '../entities';
import { UserRole } from '../common/enums';
import {
  CreateLeadDto,
  UpdateLeadDto,
  UpdateStatusDto,
  ReassignLeadDto,
  LeadFilterDto,
  CreateLeadContactDto,
  UpdateLeadContactDto,
  UpdateLeadAddressDto,
} from './dto';

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  async findAll(@Query() filters: LeadFilterDto, @CurrentUser() user: User) {
    return this.leadService.findAll(filters, user);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.findOne(id, user);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() dto: CreateLeadDto) {
    return this.leadService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: User,
  ) {
    return this.leadService.update(id, dto, user);
  }

  @Post(':id/claim')
  async claim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.claim(id, user.id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.leadService.updateStatus(id, dto, user);
  }

  @Put(':id/reassign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async reassign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReassignLeadDto,
    @CurrentUser() user: User,
  ) {
    return this.leadService.reassign(id, dto, user);
  }

  @Get(':id/history')
  async getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.getHistory(id, user);
  }

  // ============ Address Endpoints ============

  @Put(':id/address')
  async updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadAddressDto,
    @CurrentUser() user: User,
  ) {
    return this.leadService.updateAddress(id, dto, user);
  }

  // ============ Contact Endpoints ============

  @Get(':id/contacts')
  async getContacts(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.getContacts(id, user);
  }

  @Post(':id/contacts')
  async createContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLeadContactDto,
    @CurrentUser() user: User,
  ) {
    return this.leadService.createContact(id, dto, user);
  }

  @Put(':id/contacts/:contactId')
  async updateContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() dto: UpdateLeadContactDto,
    @CurrentUser() user: User,
  ) {
    return this.leadService.updateContact(id, contactId, dto, user);
  }

  @Delete(':id/contacts/:contactId')
  async deleteContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.deleteContact(id, contactId, user);
  }

  // ============ Pincode Lookup ============

  @Get('lookup/pincode/:pincode')
  async lookupPincode(@Param('pincode') pincode: string) {
    return this.leadService.lookupPincode(pincode);
  }

  // ============ Bulk Upload ============

  @Post('bulk-upload')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (file.mimetype !== 'text/csv') {
      throw new HttpException(
        'Invalid file type. Please upload a CSV file.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.leadService.bulkUploadFromCsv(file, user);
  }

  // ============ Custom Field Endpoints ============

  @Get(':id/custom-fields')
  async getCustomFields(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.getCustomFields(id, user);
  }

  @Put(':id/custom-fields/:fieldDefinitionId')
  async setCustomField(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldDefinitionId', ParseUUIDPipe) fieldDefinitionId: string,
    @Body() body: { value?: string; arrayValue?: string[] },
    @CurrentUser() user: User,
  ) {
    return this.leadService.setCustomField(
      id,
      fieldDefinitionId,
      body.value || null,
      body.arrayValue || null,
      user,
    );
  }

  @Put(':id/custom-fields')
  async bulkSetCustomFields(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: {
      fields: {
        fieldDefinitionId: string;
        value?: string;
        arrayValue?: string[];
      }[];
    },
    @CurrentUser() user: User,
  ) {
    return this.leadService.bulkSetCustomFields(id, body.fields, user);
  }

  @Delete(':id/custom-fields/:fieldDefinitionId')
  async deleteCustomField(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fieldDefinitionId', ParseUUIDPipe) fieldDefinitionId: string,
    @CurrentUser() user: User,
  ) {
    await this.leadService.deleteCustomField(id, fieldDefinitionId, user);
    return { success: true };
  }

  @Put(':id/business-type')
  async updateBusinessType(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { businessTypeId: string | null },
    @CurrentUser() user: User,
  ) {
    return this.leadService.updateBusinessType(id, body.businessTypeId, user);
  }

  @Get(':id/with-custom-fields')
  async getLeadWithCustomFields(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.leadService.getLeadWithCustomFields(id, user);
  }
}
