import { LeadStatus } from '../common/enums';
import { Lead } from './lead.entity';
import { User } from './user.entity';
export declare class LeadHistory {
    id: string;
    leadId: string;
    lead: Lead;
    previousStatus: LeadStatus;
    newStatus: LeadStatus;
    changedById: string;
    changedBy: User;
    notes: string;
    createdAt: Date;
}
