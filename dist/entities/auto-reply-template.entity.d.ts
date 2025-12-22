import { Category } from './category.entity';
export declare class AutoReplyTemplate {
    id: string;
    categoryId: string;
    category: Category;
    triggerKeyword: string;
    messageContent: string;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
