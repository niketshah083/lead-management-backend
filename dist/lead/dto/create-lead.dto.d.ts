import { LeadStatus } from '../../common/enums';
export declare class CreateLeadDto {
    phoneNumber: string;
    name?: string;
    categoryId?: string;
    businessTypeId?: string;
    status?: LeadStatus;
}
