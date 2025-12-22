import { Repository } from 'typeorm';
import { LeadStatusMaster, StatusTransition } from '../entities';
import { CreateLeadStatusDto, UpdateLeadStatusDto, CreateStatusTransitionDto, UpdateStatusTransitionDto, BulkCreateTransitionsDto } from './dto';
export declare class LeadStatusService {
    private readonly statusRepository;
    private readonly transitionRepository;
    private readonly logger;
    constructor(statusRepository: Repository<LeadStatusMaster>, transitionRepository: Repository<StatusTransition>);
    findAll(): Promise<LeadStatusMaster[]>;
    findOne(id: string): Promise<LeadStatusMaster>;
    findInitialStatus(): Promise<LeadStatusMaster | null>;
    create(dto: CreateLeadStatusDto): Promise<LeadStatusMaster>;
    update(id: string, dto: UpdateLeadStatusDto): Promise<LeadStatusMaster>;
    delete(id: string): Promise<void>;
    reorder(statuses: {
        id: string;
        order: number;
    }[]): Promise<void>;
    findAllTransitions(): Promise<StatusTransition[]>;
    findTransitionsFrom(fromStatusId: string): Promise<StatusTransition[]>;
    findAllowedNextStatuses(fromStatusId: string, userRole?: string): Promise<LeadStatusMaster[]>;
    createTransition(dto: CreateStatusTransitionDto): Promise<StatusTransition>;
    bulkCreateTransitions(dto: BulkCreateTransitionsDto): Promise<StatusTransition[]>;
    updateTransition(id: string, dto: UpdateStatusTransitionDto): Promise<StatusTransition>;
    deleteTransition(id: string): Promise<void>;
    isTransitionAllowed(fromStatusId: string, toStatusId: string, userRole?: string): Promise<{
        allowed: boolean;
        requiresComment: boolean;
    }>;
}
