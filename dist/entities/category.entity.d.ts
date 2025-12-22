import { CategoryMedia } from './category-media.entity';
import { AutoReplyTemplate } from './auto-reply-template.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    keywords: string[];
    media: CategoryMedia[];
    autoReplyTemplates: AutoReplyTemplate[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
