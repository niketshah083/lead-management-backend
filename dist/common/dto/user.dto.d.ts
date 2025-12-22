import { UserRole } from '../enums';
import { CategoryDto } from './category.dto';
export declare class UserDto {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: UserRole;
    managerId?: string;
    manager?: UserDto;
    isActive: boolean;
    categories?: CategoryDto[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class AssignCategoriesDto {
    categoryIds: string[];
}
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
    managerId?: string;
}
export declare class UpdateUserDto {
    name?: string;
    phone?: string;
    role?: UserRole;
    managerId?: string;
    isActive?: boolean;
}
