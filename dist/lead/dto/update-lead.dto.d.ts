export declare class UpdateLeadDto {
    name?: string;
    categoryId?: string;
    businessTypeId?: string;
    status?: string;
    statusMasterId?: string;
    isQualified?: boolean;
}
export declare class UpdateStatusDto {
    status?: string;
    statusMasterId?: string;
    notes?: string;
}
export declare class ReassignLeadDto {
    assignedToId: string;
    notes?: string;
}
