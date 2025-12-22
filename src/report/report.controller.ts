import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Res,
  Header,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { ReportService } from './report.service';
import { DashboardFilterDto, ReportFilterDto } from './dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER_EXECUTIVE)
  getDashboardMetrics(
    @Query() filters: DashboardFilterDto,
    @Request() req: any,
  ) {
    return this.reportService.getDashboardMetrics(filters, req.user);
  }

  @Get('leads')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getLeadReport(@Query() filters: ReportFilterDto) {
    return this.reportService.getLeadReport(filters);
  }

  @Get('business-report')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER_EXECUTIVE)
  getBusinessReport(@Query() filters: ReportFilterDto, @Request() req: any) {
    return this.reportService.getBusinessReport(filters, req.user);
  }

  @Get('executive-performance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getExecutivePerformance(
    @Query() filters: ReportFilterDto,
    @Request() req: any,
  ) {
    return this.reportService.getExecutivePerformance(filters, req.user);
  }

  @Get('monthly-trends')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER_EXECUTIVE)
  getMonthlyTrends(@Query() filters: ReportFilterDto, @Request() req: any) {
    return this.reportService.getMonthlyTrends(filters, req.user);
  }

  @Get('export/csv')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=leads-report.csv')
  async exportCsv(@Query() filters: ReportFilterDto, @Res() res: Response) {
    const buffer = await this.reportService.exportReport(filters, 'csv');
    res.send(buffer);
  }

  @Get('export/pdf')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=leads-report.pdf')
  async exportPdf(@Query() filters: ReportFilterDto, @Res() res: Response) {
    const buffer = await this.reportService.exportReport(filters, 'pdf');
    res.send(buffer);
  }

  @Get('period-report/:period')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER_EXECUTIVE)
  getPeriodReport(
    @Param('period') period: 'daily' | 'weekly' | 'monthly',
    @Query() filters: ReportFilterDto,
    @Request() req: any,
  ) {
    return this.reportService.getPeriodReport(period, filters, req.user);
  }

  @Get('lead-status-report')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER_EXECUTIVE)
  getLeadStatusReport(@Query() filters: ReportFilterDto, @Request() req: any) {
    return this.reportService.getLeadStatusReport(filters, req.user);
  }
}
