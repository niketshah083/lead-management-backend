export declare class CreateLeadContactDto {
    name: string;
    designation?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
}
export declare class UpdateLeadContactDto {
    name?: string;
    designation?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
}
export declare class UpdateLeadAddressDto {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
}
