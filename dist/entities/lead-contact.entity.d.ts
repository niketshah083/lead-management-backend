import { Lead } from './lead.entity';
export declare class LeadContact {
    id: string;
    leadId: string;
    lead: Lead;
    name: string;
    designation: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
}
