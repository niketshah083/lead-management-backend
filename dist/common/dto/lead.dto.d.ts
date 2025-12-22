import { LeadStatus } from '../enums';
import { CategoryDto } from './category.dto';
import { UserDto } from './user.dto';
export declare class LeadDto {
    id: string;
    phoneNumber: string;
    name?: string;
    categoryId?: string | null;
    category?: CategoryDto;
    status: LeadStatus;
    assignedToId?: string;
    assignedTo?: UserDto;
    claimedAt?: Date;
    isQualified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LeadFilterDto {
    status?: LeadStatus[];
    categoryId?: string;
    assignedToId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
export declare class UpdateLeadStatusDto {
    status: LeadStatus;
    notes?: string;
}
