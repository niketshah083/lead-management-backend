import { Repository, SelectQueryBuilder } from 'typeorm';
import { Lead, User } from '../../entities';
export declare class LeadVisibilityService {
    private readonly userRepository;
    private readonly leadRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, leadRepository: Repository<Lead>);
    applyVisibilityFilter(query: SelectQueryBuilder<Lead>, currentUser: User): Promise<void>;
    canAccessLead(lead: Lead, user: User): Promise<boolean>;
    getTeamMembers(managerId: string): Promise<User[]>;
    getEligibleCEsForLead(lead: Lead): Promise<User[]>;
    getVisibleLeads(user: User): Promise<Lead[]>;
}
