import { CategoryDto } from './category.dto';
import { UserDto } from './user.dto';
export declare class LeadDto {
    id: string;
    phoneNumber: string;
    name?: string;
    categoryId?: string | null;
    category?: CategoryDto;
    status: string;
    statusMasterId?: string;
    assignedToId?: string;
    assignedTo?: UserDto;
    claimedAt?: Date;
    isQualified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class LeadFilterDto {
    status?: string[];
    categoryId?: string;
    assignedToId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
export declare class UpdateLeadStatusDto {
    status?: string;
    statusMasterId?: string;
    notes?: string;
}
