import { UserRole } from '../common/enums';
import { Category } from './category.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    phone: string;
    role: UserRole;
    managerId: string | null;
    manager: User;
    subordinates: User[];
    categories: Category[];
    fcmToken: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
