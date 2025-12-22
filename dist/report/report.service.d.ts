import { Repository } from 'typeorm';
import { Lead, Message, SlaTracking, User, Category } from '../entities';
import { LeadStatus } from '../common/enums';
import { DashboardFilterDto, ReportFilterDto } from './dto';
export interface DashboardMetrics {
    totalLeads: number;
    newLeads: number;
    convertedLeads: number;
    conversionRate: number;
    avgResponseTime: number;
    slaCompliance: number;
    leadsByCategory: {
        categoryId: string;
        categoryName: string;
        count: number;
    }[];
    leadsByStatus: {
        status: LeadStatus;
        count: number;
    }[];
}
export interface LeadReport {
    data: Lead[];
    total: number;
    page: number;
    limit: number;
}
export interface BusinessReport {
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    inProgressLeads: number;
    winRate: number;
    lossRate: number;
    avgDealCycle: number;
    totalRevenue: number;
    avgDealValue: number;
    leadsByStage: {
        stage: string;
        count: number;
        percentage: number;
    }[];
    executivePerformance: ExecutivePerformance[];
    monthlyTrends: MonthlyTrend[];
    followUpMetrics: FollowUpMetrics;
}
export interface ExecutivePerformance {
    userId: string;
    userName: string;
    userRole: string;
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    inProgressLeads: number;
    winRate: number;
    avgDealCycle: number;
    totalRevenue: number;
    avgDealValue: number;
    followUpStats: {
        totalFollowUps: number;
        completedFollowUps: number;
        pendingFollowUps: number;
        overdueFollowUps: number;
    };
    slaCompliance: number;
    avgResponseTime: number;
    lastActivity: string;
}
export interface MonthlyTrend {
    month: string;
    year: number;
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    revenue: number;
    winRate: number;
}
export interface FollowUpMetrics {
    totalFollowUps: number;
    completedFollowUps: number;
    pendingFollowUps: number;
    overdueFollowUps: number;
    avgFollowUpTime: number;
    followUpCompletionRate: number;
}
export interface FollowUpMetrics {
    totalFollowUps: number;
    completedFollowUps: number;
    pendingFollowUps: number;
    overdueFollowUps: number;
    avgFollowUpTime: number;
    followUpCompletionRate: number;
}
export interface PeriodReport {
    period: string;
    startDate: string;
    endDate: string;
    executiveReports: ExecutivePeriodReport[];
    summary: {
        totalLeads: number;
        wonLeads: number;
        lostLeads: number;
        winRate: number;
        totalRevenue: number;
    };
}
export interface ExecutivePeriodReport {
    userId: string;
    userName: string;
    userRole: string;
    periods: PeriodData[];
}
export interface PeriodData {
    date: string;
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    inProgressLeads: number;
    winRate: number;
    revenue: number;
    messagesCount: number;
    avgResponseTime: number;
}
export interface LeadStatusReport {
    statusBreakdown: {
        status: LeadStatus;
        count: number;
        percentage: number;
        revenue: number;
    }[];
    conversionFunnel: {
        stage: string;
        count: number;
        conversionRate: number;
    }[];
    executiveStatusBreakdown: {
        userId: string;
        userName: string;
        statusCounts: {
            [key in LeadStatus]: number;
        };
    }[];
}
export declare class ReportService {
    private readonly leadRepository;
    private readonly messageRepository;
    private readonly slaTrackingRepository;
    private readonly userRepository;
    private readonly categoryRepository;
    private readonly logger;
    constructor(leadRepository: Repository<Lead>, messageRepository: Repository<Message>, slaTrackingRepository: Repository<SlaTracking>, userRepository: Repository<User>, categoryRepository: Repository<Category>);
    getDashboardMetrics(filters: DashboardFilterDto, currentUser?: User): Promise<DashboardMetrics>;
    getLeadReport(filters: ReportFilterDto): Promise<LeadReport>;
    getBusinessReport(filters: ReportFilterDto, currentUser?: User): Promise<BusinessReport>;
    getExecutivePerformance(filters: ReportFilterDto, currentUser?: User): Promise<ExecutivePerformance[]>;
    getMonthlyTrends(filters: ReportFilterDto, currentUser?: User): Promise<MonthlyTrend[]>;
    getPeriodReport(period: 'daily' | 'weekly' | 'monthly', filters: ReportFilterDto, currentUser?: User): Promise<PeriodReport>;
    getLeadStatusReport(filters: ReportFilterDto, currentUser?: User): Promise<LeadStatusReport>;
    private getExecutivePerformanceData;
    private getMonthlyTrendsData;
    private getLeadsForUser;
    private getLeadsForFilters;
    private calculateAvgDealCycle;
    private calculateLeadsByStage;
    private calculateFollowUpMetrics;
    private calculateAvgTimeBetweenMessages;
    private getTimeAgo;
    exportReport(filters: ReportFilterDto, format: 'csv' | 'pdf'): Promise<Buffer>;
    private calculateAvgResponseTime;
    private calculateSlaCompliance;
    private groupLeadsByCategory;
    private groupLeadsByStatus;
    private generateCsv;
    private generatePdf;
    private getPeriodDates;
    private getExecutivePeriodData;
}
