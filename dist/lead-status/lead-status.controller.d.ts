import { LeadStatusService } from './lead-status.service';
import { User } from '../entities';
import { CreateLeadStatusDto, UpdateLeadStatusDto, CreateStatusTransitionDto, UpdateStatusTransitionDto, BulkCreateTransitionsDto } from './dto';
export declare class LeadStatusController {
    private readonly statusService;
    constructor(statusService: LeadStatusService);
    findAll(): Promise<{
        data: import("../entities").LeadStatusMaster[];
    }>;
    findInitial(): Promise<{
        data: import("../entities").LeadStatusMaster | null;
    }>;
    findOne(id: string): Promise<{
        data: import("../entities").LeadStatusMaster;
    }>;
    getAllowedNextStatuses(id: string, user: User): Promise<{
        data: import("../entities").LeadStatusMaster[];
    }>;
    create(dto: CreateLeadStatusDto): Promise<{
        data: import("../entities").LeadStatusMaster;
    }>;
    update(id: string, dto: UpdateLeadStatusDto): Promise<{
        data: import("../entities").LeadStatusMaster;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    reorder(statuses: {
        id: string;
        order: number;
    }[]): Promise<{
        message: string;
    }>;
    findAllTransitions(): Promise<{
        data: import("../entities").StatusTransition[];
    }>;
    findTransitionsFrom(id: string): Promise<{
        data: import("../entities").StatusTransition[];
    }>;
    createTransition(dto: CreateStatusTransitionDto): Promise<{
        data: import("../entities").StatusTransition;
    }>;
    bulkCreateTransitions(dto: BulkCreateTransitionsDto): Promise<{
        data: import("../entities").StatusTransition[];
    }>;
    updateTransition(id: string, dto: UpdateStatusTransitionDto): Promise<{
        data: import("../entities").StatusTransition;
    }>;
    deleteTransition(id: string): Promise<{
        message: string;
    }>;
    checkTransition(fromStatusId: string, toStatusId: string, user: User): Promise<{
        data: {
            allowed: boolean;
            requiresComment: boolean;
        };
    }>;
}
