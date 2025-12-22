export declare class BulkUploadLeadDto {
    name: string;
    phoneNumber: string;
    date?: string;
    source?: string;
    categoryId?: string;
    notes?: string;
}
export declare class BulkUploadResponseDto {
    successful: number;
    failed: number;
    errors: {
        row: number;
        error: string;
    }[];
}
