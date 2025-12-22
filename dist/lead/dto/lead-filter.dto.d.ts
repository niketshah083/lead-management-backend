import { LeadStatus } from '../../common/enums';
export declare class LeadFilterDto {
    status?: LeadStatus[];
    categoryId?: string;
    assignedToId?: string;
    unassignedOnly?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
