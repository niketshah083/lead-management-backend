import { LeadService } from './lead.service';
import { User } from '../entities';
import { CreateLeadDto, UpdateLeadDto, UpdateStatusDto, ReassignLeadDto, LeadFilterDto, CreateLeadContactDto, UpdateLeadContactDto, UpdateLeadAddressDto } from './dto';
export declare class LeadController {
    private readonly leadService;
    constructor(leadService: LeadService);
    findAll(filters: LeadFilterDto, user: User): Promise<{
        data: import("../entities").Lead[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: User): Promise<import("../entities").Lead>;
    create(dto: CreateLeadDto): Promise<import("../entities").Lead>;
    update(id: string, dto: UpdateLeadDto, user: User): Promise<import("../entities").Lead>;
    claim(id: string, user: User): Promise<import("../entities").Lead>;
    updateStatus(id: string, dto: UpdateStatusDto, user: User): Promise<import("../entities").Lead>;
    reassign(id: string, dto: ReassignLeadDto, user: User): Promise<import("../entities").Lead>;
    getHistory(id: string, user: User): Promise<import("../entities").LeadHistory[]>;
    updateAddress(id: string, dto: UpdateLeadAddressDto, user: User): Promise<import("../entities").Lead>;
    getContacts(id: string, user: User): Promise<import("../entities").LeadContact[]>;
    createContact(id: string, dto: CreateLeadContactDto, user: User): Promise<import("../entities").LeadContact>;
    updateContact(id: string, contactId: string, dto: UpdateLeadContactDto, user: User): Promise<import("../entities").LeadContact>;
    deleteContact(id: string, contactId: string, user: User): Promise<void>;
    lookupPincode(pincode: string): Promise<{
        city: string;
        state: string;
        country: string;
    } | null>;
    bulkUpload(file: Express.Multer.File, user: User): Promise<{
        total: number;
        created: number;
        skipped: number;
        errors: Array<{
            row: number;
            message: string;
        }>;
    }>;
    getCustomFields(id: string, user: User): Promise<import("../entities").LeadCustomField[]>;
    setCustomField(id: string, fieldDefinitionId: string, body: {
        value?: string;
        arrayValue?: string[];
    }, user: User): Promise<import("../entities").LeadCustomField>;
    bulkSetCustomFields(id: string, body: {
        fields: {
            fieldDefinitionId: string;
            value?: string;
            arrayValue?: string[];
        }[];
    }, user: User): Promise<import("../entities").LeadCustomField[]>;
    deleteCustomField(id: string, fieldDefinitionId: string, user: User): Promise<{
        success: boolean;
    }>;
    updateBusinessType(id: string, body: {
        businessTypeId: string | null;
    }, user: User): Promise<import("../entities").Lead>;
    getLeadWithCustomFields(id: string, user: User): Promise<import("../entities").Lead & {
        customFieldValues: Record<string, any>;
    }>;
}
