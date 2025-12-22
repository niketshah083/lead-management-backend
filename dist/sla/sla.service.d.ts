import { Repository } from 'typeorm';
import { SlaPolicy, SlaTracking, Lead } from '../entities';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto';
export declare class SlaService {
    private readonly policyRepository;
    private readonly trackingRepository;
    private readonly leadRepository;
    private readonly logger;
    constructor(policyRepository: Repository<SlaPolicy>, trackingRepository: Repository<SlaTracking>, leadRepository: Repository<Lead>);
    createPolicy(dto: CreateSlaPolicyDto): Promise<SlaPolicy>;
    updatePolicy(id: string, dto: UpdateSlaPolicyDto): Promise<SlaPolicy>;
    findPolicyById(id: string): Promise<SlaPolicy>;
    findAllPolicies(): Promise<SlaPolicy[]>;
    getDefaultPolicy(): Promise<SlaPolicy | null>;
    initializeSlaTracking(leadId: string, policyId?: string): Promise<SlaTracking>;
    recordFirstResponse(leadId: string): Promise<SlaTracking>;
    recordResolution(leadId: string): Promise<SlaTracking>;
    findTrackingByLeadId(leadId: string): Promise<SlaTracking>;
    getSlaStatus(leadId: string): Promise<{
        tracking: SlaTracking;
        currentStatus: 'on_track' | 'warning' | 'breached';
        timeRemaining: number;
    }>;
    getLeadsApproachingBreach(): Promise<SlaTracking[]>;
    getBreachedLeads(): Promise<SlaTracking[]>;
}
