import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { LeadStatusService } from './lead-status.service';
import { Roles, CurrentUser } from '../auth/decorators';
import { UserRole } from '../common/enums';
import { User } from '../entities';
import {
  CreateLeadStatusDto,
  UpdateLeadStatusDto,
  CreateStatusTransitionDto,
  UpdateStatusTransitionDto,
  BulkCreateTransitionsDto,
} from './dto';

@Controller('lead-statuses')
export class LeadStatusController {
  constructor(private readonly statusService: LeadStatusService) {}

  @Get()
  async findAll() {
    const data = await this.statusService.findAll();
    return { data };
  }

  @Get('initial')
  async findInitial() {
    const data = await this.statusService.findInitialStatus();
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.statusService.findOne(id);
    return { data };
  }

  @Get(':id/allowed-next')
  async getAllowedNextStatuses(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.statusService.findAllowedNextStatuses(
      id,
      user.role,
    );
    return { data };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() dto: CreateLeadStatusDto) {
    const data = await this.statusService.create(dto);
    return { data };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    const data = await this.statusService.update(id, dto);
    return { data };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.statusService.delete(id);
    return { message: 'Lead status deleted successfully' };
  }

  @Put('reorder/all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async reorder(@Body() statuses: { id: string; order: number }[]) {
    await this.statusService.reorder(statuses);
    return { message: 'Lead statuses reordered successfully' };
  }

  // ============ Status Transition Endpoints ============

  @Get('transitions/all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async findAllTransitions() {
    const data = await this.statusService.findAllTransitions();
    return { data };
  }

  @Get(':id/transitions')
  async findTransitionsFrom(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.statusService.findTransitionsFrom(id);
    return { data };
  }

  @Post('transitions')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async createTransition(@Body() dto: CreateStatusTransitionDto) {
    const data = await this.statusService.createTransition(dto);
    return { data };
  }

  @Post('transitions/bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async bulkCreateTransitions(@Body() dto: BulkCreateTransitionsDto) {
    const data = await this.statusService.bulkCreateTransitions(dto);
    return { data };
  }

  @Put('transitions/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async updateTransition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusTransitionDto,
  ) {
    const data = await this.statusService.updateTransition(id, dto);
    return { data };
  }

  @Delete('transitions/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteTransition(@Param('id', ParseUUIDPipe) id: string) {
    await this.statusService.deleteTransition(id);
    return { message: 'Status transition deleted successfully' };
  }

  @Get('transitions/check')
  async checkTransition(
    @Query('from') fromStatusId: string,
    @Query('to') toStatusId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.statusService.isTransitionAllowed(
      fromStatusId,
      toStatusId,
      user.role,
    );
    return { data };
  }
}
