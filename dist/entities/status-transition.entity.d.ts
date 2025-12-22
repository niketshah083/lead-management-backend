import { LeadStatusMaster } from './lead-status-master.entity';
export declare class StatusTransition {
    id: string;
    fromStatusId: string;
    fromStatus: LeadStatusMaster;
    toStatusId: string;
    toStatus: LeadStatusMaster;
    isActive: boolean;
    requiresComment: boolean;
    allowedRoles: string[];
    createdAt: Date;
    updatedAt: Date;
}
