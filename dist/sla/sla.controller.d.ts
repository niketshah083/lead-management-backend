import { SlaService } from './sla.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto';
export declare class SlaController {
    private readonly slaService;
    constructor(slaService: SlaService);
    createPolicy(dto: CreateSlaPolicyDto): Promise<import("../entities").SlaPolicy>;
    findAllPolicies(): Promise<import("../entities").SlaPolicy[]>;
    findPolicy(id: string): Promise<import("../entities").SlaPolicy>;
    updatePolicy(id: string, dto: UpdateSlaPolicyDto): Promise<import("../entities").SlaPolicy>;
    getSlaStatus(leadId: string): Promise<{
        tracking: import("../entities").SlaTracking;
        currentStatus: "on_track" | "warning" | "breached";
        timeRemaining: number;
    }>;
    getLeadsApproachingBreach(): Promise<import("../entities").SlaTracking[]>;
    getBreachedLeads(): Promise<import("../entities").SlaTracking[]>;
}
