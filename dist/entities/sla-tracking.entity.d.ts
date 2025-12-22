import { Lead } from './lead.entity';
import { SlaPolicy } from './sla-policy.entity';
export declare class SlaTracking {
    id: string;
    leadId: string;
    lead: Lead;
    policyId: string;
    policy: SlaPolicy;
    firstResponseDue: Date;
    firstResponseAt: Date;
    firstResponseBreached: boolean;
    resolutionDue: Date;
    resolvedAt: Date;
    resolutionBreached: boolean;
    createdAt: Date;
    updatedAt: Date;
}
