import { Response } from 'express';
import { ReportService } from './report.service';
import { DashboardFilterDto, ReportFilterDto } from './dto';
export declare class ReportController {
    private readonly reportService;
    constructor(reportService: ReportService);
    getDashboardMetrics(filters: DashboardFilterDto, req: any): Promise<import("./report.service").DashboardMetrics>;
    getLeadReport(filters: ReportFilterDto): Promise<import("./report.service").LeadReport>;
    getBusinessReport(filters: ReportFilterDto, req: any): Promise<import("./report.service").BusinessReport>;
    getExecutivePerformance(filters: ReportFilterDto, req: any): Promise<import("./report.service").ExecutivePerformance[]>;
    getMonthlyTrends(filters: ReportFilterDto, req: any): Promise<import("./report.service").MonthlyTrend[]>;
    exportCsv(filters: ReportFilterDto, res: Response): Promise<void>;
    exportPdf(filters: ReportFilterDto, res: Response): Promise<void>;
    getPeriodReport(period: 'daily' | 'weekly' | 'monthly', filters: ReportFilterDto, req: any): Promise<import("./report.service").PeriodReport>;
    getLeadStatusReport(filters: ReportFilterDto, req: any): Promise<import("./report.service").LeadStatusReport>;
}
