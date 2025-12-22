import { Repository } from 'typeorm';
import { Lead, LeadHistory, LeadContact, Message, User, LeadCustomField, BusinessType, FieldDefinition } from '../entities';
import { CreateLeadDto, UpdateLeadDto, UpdateStatusDto, ReassignLeadDto, LeadFilterDto, CreateLeadContactDto, UpdateLeadContactDto, UpdateLeadAddressDto } from './dto';
export declare class LeadService {
    private readonly leadRepository;
    private readonly leadHistoryRepository;
    private readonly leadContactRepository;
    private readonly messageRepository;
    private readonly userRepository;
    private readonly leadCustomFieldRepository;
    private readonly businessTypeRepository;
    private readonly fieldDefinitionRepository;
    private readonly logger;
    constructor(leadRepository: Repository<Lead>, leadHistoryRepository: Repository<LeadHistory>, leadContactRepository: Repository<LeadContact>, messageRepository: Repository<Message>, userRepository: Repository<User>, leadCustomFieldRepository: Repository<LeadCustomField>, businessTypeRepository: Repository<BusinessType>, fieldDefinitionRepository: Repository<FieldDefinition>);
    create(dto: CreateLeadDto): Promise<Lead>;
    findAll(filters: LeadFilterDto, currentUser: User): Promise<{
        data: Lead[];
        total: number;
        page: number;
        limit: number;
    }>;
    private applyRoleBasedFilter;
    findOne(id: string, currentUser: User): Promise<Lead>;
    claim(id: string, userId: string): Promise<Lead>;
    update(id: string, dto: UpdateLeadDto, currentUser: User): Promise<Lead>;
    updateStatus(id: string, dto: UpdateStatusDto, currentUser: User): Promise<Lead>;
    reassign(id: string, dto: ReassignLeadDto, currentUser: User): Promise<Lead>;
    getHistory(id: string, currentUser: User): Promise<LeadHistory[]>;
    findOrCreateByPhone(phoneNumber: string, categoryId: string): Promise<Lead>;
    private createHistoryRecord;
    private checkLeadAccess;
    updateAddress(leadId: string, dto: UpdateLeadAddressDto, currentUser: User): Promise<Lead>;
    getContacts(leadId: string, currentUser: User): Promise<LeadContact[]>;
    createContact(leadId: string, dto: CreateLeadContactDto, currentUser: User): Promise<LeadContact>;
    updateContact(leadId: string, contactId: string, dto: UpdateLeadContactDto, currentUser: User): Promise<LeadContact>;
    deleteContact(leadId: string, contactId: string, currentUser: User): Promise<void>;
    lookupPincode(pincode: string): Promise<{
        city: string;
        state: string;
        country: string;
    } | null>;
    bulkUpload(leads: any[], currentUser: User): Promise<{
        successful: number;
        failed: number;
        errors: any[];
    }>;
    bulkUploadFromCsv(file: Express.Multer.File, currentUser: User): Promise<{
        total: number;
        created: number;
        skipped: number;
        errors: Array<{
            row: number;
            message: string;
        }>;
    }>;
    getCustomFields(leadId: string, currentUser: User): Promise<LeadCustomField[]>;
    setCustomField(leadId: string, fieldDefinitionId: string, value: string | null, arrayValue: string[] | null, currentUser: User): Promise<LeadCustomField>;
    bulkSetCustomFields(leadId: string, fields: {
        fieldDefinitionId: string;
        value?: string;
        arrayValue?: string[];
    }[], currentUser: User): Promise<LeadCustomField[]>;
    deleteCustomField(leadId: string, fieldDefinitionId: string, currentUser: User): Promise<void>;
    updateBusinessType(leadId: string, businessTypeId: string | null, currentUser: User): Promise<Lead>;
    getLeadWithCustomFields(leadId: string, currentUser: User): Promise<Lead & {
        customFieldValues: Record<string, any>;
    }>;
}
