import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { SlaService } from './sla.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto';

@Controller('sla')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Post('policies')
  @Roles(UserRole.ADMIN)
  createPolicy(@Body() dto: CreateSlaPolicyDto) {
    return this.slaService.createPolicy(dto);
  }

  @Get('policies')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAllPolicies() {
    return this.slaService.findAllPolicies();
  }

  @Get('policies/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findPolicy(@Param('id', ParseUUIDPipe) id: string) {
    return this.slaService.findPolicyById(id);
  }

  @Put('policies/:id')
  @Roles(UserRole.ADMIN)
  updatePolicy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSlaPolicyDto,
  ) {
    return this.slaService.updatePolicy(id, dto);
  }

  @Get('leads/:leadId/status')
  getSlaStatus(@Param('leadId', ParseUUIDPipe) leadId: string) {
    return this.slaService.getSlaStatus(leadId);
  }

  @Get('warnings')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getLeadsApproachingBreach() {
    return this.slaService.getLeadsApproachingBreach();
  }

  @Get('breaches')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getBreachedLeads() {
    return this.slaService.getBreachedLeads();
  }
}
