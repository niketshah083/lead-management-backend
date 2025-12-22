import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserDto, AssignCategoriesDto } from '../common/dto/user.dto';
import { CategoryDto } from '../common/dto/category.dto';
import { User } from '../entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<UserDto>;
    findAll(currentUser: User): Promise<UserDto[]>;
    findOne(id: string, currentUser: User): Promise<UserDto>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<UserDto>;
    deactivate(id: string, currentUser: User): Promise<void>;
    assignManager(ceId: string, managerId: string): Promise<UserDto>;
    unassignManager(ceId: string): Promise<UserDto>;
    getTeamMembers(managerId: string, currentUser: User): Promise<UserDto[]>;
    assignCategories(userId: string, assignCategoriesDto: AssignCategoriesDto): Promise<UserDto>;
    addCategory(userId: string, categoryId: string): Promise<UserDto>;
    removeCategory(userId: string, categoryId: string): Promise<UserDto>;
    getUserCategories(userId: string): Promise<CategoryDto[]>;
}
