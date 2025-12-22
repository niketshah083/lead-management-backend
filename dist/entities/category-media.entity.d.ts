import { MediaType } from '../common/enums';
import { Category } from './category.entity';
export declare class CategoryMedia {
    id: string;
    categoryId: string;
    category: Category;
    url: string;
    type: MediaType;
    filename: string;
    size: number;
    createdAt: Date;
}
