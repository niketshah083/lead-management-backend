import { LeadStatus } from '../../common/enums';
export declare class UpdateLeadDto {
    name?: string;
    categoryId?: string;
    businessTypeId?: string;
    status?: LeadStatus;
    isQualified?: boolean;
}
export declare class UpdateStatusDto {
    status: LeadStatus;
    notes?: string;
}
export declare class ReassignLeadDto {
    assignedToId: string;
    notes?: string;
}
