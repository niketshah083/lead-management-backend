export declare class CreateLeadStatusDto {
    name: string;
    description?: string;
    color?: string;
    bgColor?: string;
    icon?: string;
    order?: number;
    isInitial?: boolean;
    isFinal?: boolean;
    statusType?: string;
}
export declare class UpdateLeadStatusDto {
    name?: string;
    description?: string;
    color?: string;
    bgColor?: string;
    icon?: string;
    order?: number;
    isActive?: boolean;
    isInitial?: boolean;
    isFinal?: boolean;
    statusType?: string;
}
export declare class CreateStatusTransitionDto {
    fromStatusId: string;
    toStatusId: string;
    requiresComment?: boolean;
    allowedRoles?: string[];
}
export declare class UpdateStatusTransitionDto {
    isActive?: boolean;
    requiresComment?: boolean;
    allowedRoles?: string[];
}
export declare class BulkCreateTransitionsDto {
    fromStatusId: string;
    toStatusIds: string[];
    requiresComment?: boolean;
}
