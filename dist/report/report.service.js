"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const enums_1 = require("../common/enums");
let ReportService = ReportService_1 = class ReportService {
    leadRepository;
    messageRepository;
    slaTrackingRepository;
    userRepository;
    categoryRepository;
    logger = new common_1.Logger(ReportService_1.name);
    constructor(leadRepository, messageRepository, slaTrackingRepository, userRepository, categoryRepository) {
        this.leadRepository = leadRepository;
        this.messageRepository = messageRepository;
        this.slaTrackingRepository = slaTrackingRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }
    async getDashboardMetrics(filters, currentUser) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .where('lead.deletedAt IS NULL');
        if (currentUser && currentUser.role === enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            query.andWhere('lead.assignedToId = :userId', { userId: currentUser.id });
        }
        if (filters.dateFrom) {
            query.andWhere('lead.createdAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters.dateTo) {
            query.andWhere('lead.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.categoryId) {
            query.andWhere('lead.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        const leads = await query.getMany();
        const totalLeads = leads.length;
        const newLeads = leads.filter((l) => l.status === enums_1.LeadStatus.NEW).length;
        const convertedLeads = leads.filter((l) => l.status === enums_1.LeadStatus.WON).length;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        const avgResponseTime = await this.calculateAvgResponseTime(leads.map((l) => l.id));
        const slaCompliance = await this.calculateSlaCompliance(leads.map((l) => l.id));
        const leadsByCategory = await this.groupLeadsByCategory(leads);
        const leadsByStatus = this.groupLeadsByStatus(leads);
        return {
            totalLeads,
            newLeads,
            convertedLeads,
            conversionRate: Math.round(conversionRate * 100) / 100,
            avgResponseTime: Math.round(avgResponseTime),
            slaCompliance: Math.round(slaCompliance * 100) / 100,
            leadsByCategory,
            leadsByStatus,
        };
    }
    async getLeadReport(filters) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
            .where('lead.deletedAt IS NULL');
        if (filters.dateFrom) {
            query.andWhere('lead.createdAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters.dateTo) {
            query.andWhere('lead.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.categoryId) {
            query.andWhere('lead.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        if (filters.userId) {
            query.andWhere('lead.assignedToId = :userId', { userId: filters.userId });
        }
        if (filters.status && filters.status.length > 0) {
            query.andWhere('lead.status IN (:...status)', { status: filters.status });
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const [data, total] = await query
            .orderBy('lead.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { data, total, page, limit };
    }
    async getBusinessReport(filters, currentUser) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
            .where('lead.deletedAt IS NULL');
        if (currentUser && currentUser.role === enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            query.andWhere('lead.assignedToId = :userId', { userId: currentUser.id });
        }
        if (filters.dateFrom) {
            query.andWhere('lead.createdAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters.dateTo) {
            query.andWhere('lead.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.categoryId) {
            query.andWhere('lead.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        const leads = await query.getMany();
        const totalLeads = leads.length;
        const wonLeads = leads.filter((l) => l.status === enums_1.LeadStatus.WON).length;
        const lostLeads = leads.filter((l) => l.status === enums_1.LeadStatus.LOST).length;
        const inProgressLeads = leads.filter((l) => ![enums_1.LeadStatus.WON, enums_1.LeadStatus.LOST].includes(l.status)).length;
        const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
        const lossRate = totalLeads > 0 ? (lostLeads / totalLeads) * 100 : 0;
        const avgDealCycle = await this.calculateAvgDealCycle(leads);
        const totalRevenue = leads
            .filter((l) => l.status === enums_1.LeadStatus.WON)
            .reduce((sum, lead) => {
            const dealValue = lead.dealValue || 5000;
            return sum + dealValue;
        }, 0);
        const avgDealValue = wonLeads > 0 ? totalRevenue / wonLeads : 0;
        const leadsByStage = this.calculateLeadsByStage(leads);
        const executivePerformance = await this.getExecutivePerformanceData(filters, currentUser);
        const monthlyTrends = await this.getMonthlyTrendsData(filters, currentUser);
        const followUpMetrics = await this.calculateFollowUpMetrics(leads);
        return {
            totalLeads,
            wonLeads,
            lostLeads,
            inProgressLeads,
            winRate: Math.round(winRate * 100) / 100,
            lossRate: Math.round(lossRate * 100) / 100,
            avgDealCycle,
            totalRevenue,
            avgDealValue: Math.round(avgDealValue),
            leadsByStage,
            executivePerformance,
            monthlyTrends,
            followUpMetrics,
        };
    }
    async getExecutivePerformance(filters, currentUser) {
        return this.getExecutivePerformanceData(filters, currentUser);
    }
    async getMonthlyTrends(filters, currentUser) {
        return this.getMonthlyTrendsData(filters, currentUser);
    }
    async getPeriodReport(period, filters, currentUser) {
        const { startDate, endDate } = this.getPeriodDates(period, filters);
        let users = await this.userRepository.find({
            where: { isActive: true },
        });
        if (currentUser && currentUser.role === enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            users = users.filter((u) => u.id === currentUser.id);
        }
        const executiveReports = [];
        let totalLeads = 0, wonLeads = 0, lostLeads = 0, totalRevenue = 0;
        for (const user of users) {
            const periods = await this.getExecutivePeriodData(user, period, startDate, endDate, filters);
            executiveReports.push({
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                periods,
            });
            periods.forEach((p) => {
                totalLeads += p.totalLeads;
                wonLeads += p.wonLeads;
                lostLeads += p.lostLeads;
                totalRevenue += p.revenue;
            });
        }
        const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
        return {
            period,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            executiveReports,
            summary: {
                totalLeads,
                wonLeads,
                lostLeads,
                winRate: Math.round(winRate * 100) / 100,
                totalRevenue,
            },
        };
    }
    async getLeadStatusReport(filters, currentUser) {
        const leads = await this.getLeadsForFilters(filters, currentUser);
        const totalLeads = leads.length;
        const statusMap = new Map();
        for (const status of Object.values(enums_1.LeadStatus)) {
            statusMap.set(status, { count: 0, revenue: 0 });
        }
        for (const lead of leads) {
            const current = statusMap.get(lead.status);
            if (current) {
                current.count++;
                if (lead.status === enums_1.LeadStatus.WON) {
                    current.revenue += lead.dealValue || 5000;
                }
            }
        }
        const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
            status,
            count: data.count,
            percentage: totalLeads > 0 ? (data.count / totalLeads) * 100 : 0,
            revenue: data.revenue,
        }));
        const conversionFunnel = [
            {
                stage: 'New Leads',
                count: statusMap.get(enums_1.LeadStatus.NEW)?.count || 0,
                conversionRate: 100,
            },
            {
                stage: 'Qualified',
                count: statusMap.get(enums_1.LeadStatus.QUALIFIED)?.count || 0,
                conversionRate: totalLeads > 0
                    ? ((statusMap.get(enums_1.LeadStatus.QUALIFIED)?.count || 0) / totalLeads) *
                        100
                    : 0,
            },
            {
                stage: 'Won',
                count: statusMap.get(enums_1.LeadStatus.WON)?.count || 0,
                conversionRate: totalLeads > 0
                    ? ((statusMap.get(enums_1.LeadStatus.WON)?.count || 0) / totalLeads) * 100
                    : 0,
            },
        ];
        const users = await this.userRepository.find({ where: { isActive: true } });
        const executiveStatusBreakdown = [];
        for (const user of users) {
            const userLeads = leads.filter((l) => l.assignedTo?.id === user.id);
            const statusCounts = {};
            for (const status of Object.values(enums_1.LeadStatus)) {
                statusCounts[status] = 0;
            }
            userLeads.forEach((lead) => {
                statusCounts[lead.status]++;
            });
            if (userLeads.length > 0) {
                executiveStatusBreakdown.push({
                    userId: user.id,
                    userName: user.name,
                    statusCounts,
                });
            }
        }
        return {
            statusBreakdown,
            conversionFunnel,
            executiveStatusBreakdown,
        };
    }
    async getExecutivePerformanceData(filters, currentUser) {
        let users = await this.userRepository.find({
            where: { isActive: true },
        });
        if (currentUser && currentUser.role === enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            users = users.filter((u) => u.id === currentUser.id);
        }
        const performances = [];
        for (const user of users) {
            const userFilters = { ...filters, userId: user.id };
            const userLeads = await this.getLeadsForUser(userFilters);
            const totalLeads = userLeads.length;
            const wonLeads = userLeads.filter((l) => l.status === enums_1.LeadStatus.WON).length;
            const lostLeads = userLeads.filter((l) => l.status === enums_1.LeadStatus.LOST).length;
            const inProgressLeads = userLeads.filter((l) => ![enums_1.LeadStatus.WON, enums_1.LeadStatus.LOST].includes(l.status)).length;
            const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
            const avgDealCycle = await this.calculateAvgDealCycle(userLeads);
            const totalRevenue = userLeads
                .filter((l) => l.status === enums_1.LeadStatus.WON)
                .reduce((sum, lead) => {
                const dealValue = lead.dealValue || 5000;
                return sum + dealValue;
            }, 0);
            const avgDealValue = wonLeads > 0 ? totalRevenue / wonLeads : 0;
            const leadIds = userLeads.map((l) => l.id);
            const messages = await this.messageRepository.find({
                where: { leadId: (0, typeorm_2.In)(leadIds) },
            });
            const followUpStats = {
                totalFollowUps: messages.length,
                completedFollowUps: messages.filter((m) => m.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
                pendingFollowUps: Math.max(0, totalLeads - Math.floor(messages.length / 2)),
                overdueFollowUps: Math.max(0, Math.floor(totalLeads * 0.1)),
            };
            const avgResponseTime = await this.calculateAvgResponseTime(userLeads.map((l) => l.id));
            const slaCompliance = await this.calculateSlaCompliance(userLeads.map((l) => l.id));
            const lastMessage = await this.messageRepository.findOne({
                where: { leadId: (0, typeorm_2.In)(userLeads.map((l) => l.id)) },
                order: { createdAt: 'DESC' },
            });
            const lastActivity = lastMessage
                ? this.getTimeAgo(lastMessage.createdAt)
                : userLeads.length > 0
                    ? 'No messages yet'
                    : 'No activity';
            performances.push({
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                totalLeads,
                wonLeads,
                lostLeads,
                inProgressLeads,
                winRate: Math.round(winRate * 100) / 100,
                avgDealCycle,
                totalRevenue,
                avgDealValue: Math.round(avgDealValue),
                followUpStats,
                slaCompliance: Math.round(slaCompliance * 100) / 100,
                avgResponseTime: Math.round(avgResponseTime),
                lastActivity,
            });
        }
        return performances.sort((a, b) => b.totalLeads - a.totalLeads);
    }
    async getMonthlyTrendsData(filters, currentUser) {
        const trends = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            const monthFilters = {
                ...filters,
                dateFrom: date.toISOString().split('T')[0],
                dateTo: nextMonth.toISOString().split('T')[0],
            };
            const monthLeads = await this.getLeadsForFilters(monthFilters, currentUser);
            const wonLeads = monthLeads.filter((l) => l.status === enums_1.LeadStatus.WON).length;
            const lostLeads = monthLeads.filter((l) => l.status === enums_1.LeadStatus.LOST).length;
            const revenue = wonLeads * 5000;
            const winRate = monthLeads.length > 0 ? (wonLeads / monthLeads.length) * 100 : 0;
            trends.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                year: date.getFullYear(),
                totalLeads: monthLeads.length,
                wonLeads,
                lostLeads,
                revenue,
                winRate: Math.round(winRate * 100) / 100,
            });
        }
        return trends;
    }
    async getLeadsForUser(filters) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
            .where('lead.deletedAt IS NULL');
        if (filters.userId) {
            query.andWhere('lead.assignedToId = :userId', { userId: filters.userId });
        }
        if (filters.dateFrom) {
            query.andWhere('lead.createdAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters.dateTo) {
            query.andWhere('lead.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.categoryId) {
            query.andWhere('lead.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        return query.getMany();
    }
    async getLeadsForFilters(filters, currentUser) {
        const query = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.category', 'category')
            .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
            .where('lead.deletedAt IS NULL');
        if (currentUser && currentUser.role === enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            query.andWhere('lead.assignedToId = :userId', { userId: currentUser.id });
        }
        if (filters.userId) {
            query.andWhere('lead.assignedToId = :filterUserId', {
                filterUserId: filters.userId,
            });
        }
        if (filters.dateFrom) {
            query.andWhere('lead.createdAt >= :dateFrom', {
                dateFrom: filters.dateFrom,
            });
        }
        if (filters.dateTo) {
            query.andWhere('lead.createdAt <= :dateTo', { dateTo: filters.dateTo });
        }
        if (filters.categoryId) {
            query.andWhere('lead.categoryId = :categoryId', {
                categoryId: filters.categoryId,
            });
        }
        return query.getMany();
    }
    async calculateAvgDealCycle(leads) {
        const closedLeads = leads.filter((l) => [enums_1.LeadStatus.WON, enums_1.LeadStatus.LOST].includes(l.status));
        if (closedLeads.length === 0)
            return 0;
        const dealCycles = closedLeads.map((lead) => {
            const createdDate = new Date(lead.createdAt);
            const closedDate = new Date(lead.updatedAt);
            const diffTime = Math.abs(closedDate.getTime() - createdDate.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        });
        if (dealCycles.length === 0)
            return 0;
        return Math.round(dealCycles.reduce((a, b) => a + b, 0) / dealCycles.length);
    }
    calculateLeadsByStage(leads) {
        const stageMap = new Map();
        const totalLeads = leads.length;
        for (const status of Object.values(enums_1.LeadStatus)) {
            stageMap.set(status, 0);
        }
        for (const lead of leads) {
            const current = stageMap.get(lead.status) || 0;
            stageMap.set(lead.status, current + 1);
        }
        return Array.from(stageMap.entries())
            .map(([stage, count]) => ({
            stage: stage.replace('_', ' ').toUpperCase(),
            count,
            percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
        }))
            .filter((item) => item.count > 0)
            .sort((a, b) => b.count - a.count);
    }
    async calculateFollowUpMetrics(leads) {
        const leadIds = leads.map((l) => l.id);
        const messages = await this.messageRepository.find({
            where: { leadId: (0, typeorm_2.In)(leadIds) },
        });
        const totalFollowUps = messages.length;
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const completedFollowUps = messages.filter((m) => m.createdAt < oneDayAgo).length;
        const pendingFollowUps = Math.max(0, leads.length - Math.floor(messages.length / leads.length || 1));
        const overdueFollowUps = Math.max(0, Math.floor(leads.length * 0.05));
        const avgFollowUpTime = messages.length > 1 ? this.calculateAvgTimeBetweenMessages(messages) : 24;
        const followUpCompletionRate = totalFollowUps > 0 ? (completedFollowUps / totalFollowUps) * 100 : 0;
        return {
            totalFollowUps,
            completedFollowUps,
            pendingFollowUps,
            overdueFollowUps,
            avgFollowUpTime,
            followUpCompletionRate: Math.round(followUpCompletionRate * 100) / 100,
        };
    }
    calculateAvgTimeBetweenMessages(messages) {
        if (messages.length < 2)
            return 24;
        const sortedMessages = messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        let totalHours = 0;
        for (let i = 1; i < sortedMessages.length; i++) {
            const diff = sortedMessages[i].createdAt.getTime() -
                sortedMessages[i - 1].createdAt.getTime();
            totalHours += diff / (1000 * 60 * 60);
        }
        return Math.round(totalHours / (sortedMessages.length - 1));
    }
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60)
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7)
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }
    async exportReport(filters, format) {
        const report = await this.getLeadReport({ ...filters, limit: 10000 });
        if (format === 'csv') {
            return this.generateCsv(report.data);
        }
        return this.generatePdf(report.data);
    }
    async calculateAvgResponseTime(leadIds) {
        if (leadIds.length === 0)
            return 0;
        const trackings = await this.slaTrackingRepository.find({
            where: { leadId: (0, typeorm_2.In)(leadIds) },
        });
        const responseTimes = trackings
            .filter((t) => t.firstResponseAt)
            .map((t) => t.firstResponseAt.getTime() - t.createdAt.getTime());
        if (responseTimes.length === 0)
            return 0;
        const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        return avgMs / (60 * 1000);
    }
    async calculateSlaCompliance(leadIds) {
        if (leadIds.length === 0)
            return 100;
        const trackings = await this.slaTrackingRepository.find({
            where: { leadId: (0, typeorm_2.In)(leadIds) },
        });
        if (trackings.length === 0)
            return 100;
        const compliant = trackings.filter((t) => !t.firstResponseBreached && !t.resolutionBreached).length;
        return (compliant / trackings.length) * 100;
    }
    async groupLeadsByCategory(leads) {
        const categoryMap = new Map();
        for (const lead of leads) {
            const catId = lead.categoryId || 'uncategorized';
            const existing = categoryMap.get(catId);
            if (existing) {
                existing.count++;
            }
            else {
                categoryMap.set(catId, {
                    name: lead.category?.name || 'Uncategorized',
                    count: 1,
                });
            }
        }
        return Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
            categoryId,
            categoryName: data.name,
            count: data.count,
        }));
    }
    groupLeadsByStatus(leads) {
        const statusMap = new Map();
        for (const status of Object.values(enums_1.LeadStatus)) {
            statusMap.set(status, 0);
        }
        for (const lead of leads) {
            const current = statusMap.get(lead.status) || 0;
            statusMap.set(lead.status, current + 1);
        }
        return Array.from(statusMap.entries()).map(([status, count]) => ({
            status,
            count,
        }));
    }
    generateCsv(leads) {
        const headers = [
            'ID',
            'Phone',
            'Category',
            'Status',
            'Assigned To',
            'Created At',
        ];
        const rows = leads.map((lead) => [
            lead.id,
            lead.phoneNumber,
            lead.category?.name || '',
            lead.status,
            lead.assignedTo?.name || '',
            lead.createdAt.toISOString(),
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        return Buffer.from(csv, 'utf-8');
    }
    generatePdf(leads) {
        const content = leads
            .map((lead) => `Lead: ${lead.phoneNumber} | Status: ${lead.status} | Category: ${lead.category?.name || 'N/A'}`)
            .join('\n');
        return Buffer.from(content, 'utf-8');
    }
    getPeriodDates(period, filters) {
        const now = new Date();
        let startDate;
        let endDate = new Date(now);
        if (filters.dateTo) {
            endDate = new Date(filters.dateTo);
        }
        if (filters.dateFrom) {
            startDate = new Date(filters.dateFrom);
        }
        else {
            switch (period) {
                case 'daily':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'weekly':
                    startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'monthly':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
                    break;
                default:
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
        }
        return { startDate, endDate };
    }
    async getExecutivePeriodData(user, period, startDate, endDate, filters) {
        const periods = [];
        const current = new Date(startDate);
        while (current <= endDate) {
            let periodEnd;
            let dateLabel;
            switch (period) {
                case 'daily':
                    periodEnd = new Date(current);
                    periodEnd.setDate(periodEnd.getDate() + 1);
                    dateLabel = current.toISOString().split('T')[0];
                    break;
                case 'weekly':
                    periodEnd = new Date(current);
                    periodEnd.setDate(periodEnd.getDate() + 7);
                    dateLabel = `Week of ${current.toISOString().split('T')[0]}`;
                    break;
                case 'monthly':
                    periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1);
                    dateLabel = current.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                    });
                    break;
                default:
                    periodEnd = new Date(current);
                    periodEnd.setDate(periodEnd.getDate() + 1);
                    dateLabel = current.toISOString().split('T')[0];
            }
            const periodLeads = await this.leadRepository.find({
                where: {
                    assignedToId: user.id,
                    createdAt: (0, typeorm_2.Between)(current, periodEnd),
                    deletedAt: (0, typeorm_2.IsNull)(),
                    ...(filters.categoryId && { categoryId: filters.categoryId }),
                },
            });
            const totalLeads = periodLeads.length;
            const wonLeads = periodLeads.filter((l) => l.status === enums_1.LeadStatus.WON).length;
            const lostLeads = periodLeads.filter((l) => l.status === enums_1.LeadStatus.LOST).length;
            const inProgressLeads = periodLeads.filter((l) => ![enums_1.LeadStatus.WON, enums_1.LeadStatus.LOST].includes(l.status)).length;
            const winRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
            const revenue = wonLeads * 5000;
            const leadIds = periodLeads.map((l) => l.id);
            const messagesCount = leadIds.length > 0
                ? await this.messageRepository.count({
                    where: {
                        leadId: (0, typeorm_2.In)(leadIds),
                        createdAt: (0, typeorm_2.Between)(current, periodEnd),
                    },
                })
                : 0;
            const avgResponseTime = await this.calculateAvgResponseTime(leadIds);
            periods.push({
                date: dateLabel,
                totalLeads,
                wonLeads,
                lostLeads,
                inProgressLeads,
                winRate: Math.round(winRate * 100) / 100,
                revenue,
                messagesCount,
                avgResponseTime: Math.round(avgResponseTime),
            });
            switch (period) {
                case 'daily':
                    current.setDate(current.getDate() + 1);
                    break;
                case 'weekly':
                    current.setDate(current.getDate() + 7);
                    break;
                case 'monthly':
                    current.setMonth(current.getMonth() + 1);
                    break;
            }
        }
        return periods;
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = ReportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.SlaTracking)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportService);
//# sourceMappingURL=report.service.js.map