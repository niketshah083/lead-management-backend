import { User } from './user.entity';
import { Category } from './category.entity';
export declare class UserCategory {
    id: string;
    userId: string;
    user: User;
    categoryId: string;
    category: Category;
}
