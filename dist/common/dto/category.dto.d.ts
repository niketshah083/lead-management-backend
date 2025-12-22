import { MediaType } from '../enums';
export declare class MediaDto {
    id: string;
    url: string;
    signedUrl?: string;
    type: MediaType;
    filename: string;
    size: number;
}
export declare class AutoReplyTemplateDto {
    id: string;
    triggerKeyword: string;
    messageContent: string;
    priority: number;
    isActive: boolean;
}
export declare class CategoryDto {
    id: string;
    name: string;
    description: string;
    keywords: string[];
    media?: MediaDto[];
    autoReplyTemplates?: AutoReplyTemplateDto[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateCategoryDto {
    name: string;
    description: string;
    keywords: string[];
}
export declare class UpdateCategoryDto {
    name?: string;
    description?: string;
    keywords?: string[];
    isActive?: boolean;
}
