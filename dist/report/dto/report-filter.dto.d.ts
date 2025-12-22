import { LeadStatus } from '../../common/enums';
export declare class ReportFilterDto {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    userId?: string;
    status?: LeadStatus[];
    page?: number;
    limit?: number;
}
