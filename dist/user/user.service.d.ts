import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { UserCategory } from '../entities/user-category.entity';
import { CreateUserDto, UpdateUserDto, UserDto, AssignCategoriesDto } from '../common/dto/user.dto';
import { CategoryDto } from '../common/dto/category.dto';
export declare class UserService {
    private userRepository;
    private categoryRepository;
    private userCategoryRepository;
    private dataSource;
    constructor(userRepository: Repository<User>, categoryRepository: Repository<Category>, userCategoryRepository: Repository<UserCategory>, dataSource: DataSource);
    create(createUserDto: CreateUserDto): Promise<UserDto>;
    findAll(currentUser: User): Promise<UserDto[]>;
    findOne(id: string, currentUser: User): Promise<UserDto>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<UserDto>;
    deactivate(id: string, currentUser: User): Promise<void>;
    assignManager(ceId: string, managerId: string): Promise<UserDto>;
    unassignManager(ceId: string): Promise<UserDto>;
    getTeamMembers(managerId: string): Promise<UserDto[]>;
    assignCategories(userId: string, assignCategoriesDto: AssignCategoriesDto): Promise<UserDto>;
    removeCategory(userId: string, categoryId: string): Promise<UserDto>;
    getUserCategories(userId: string): Promise<CategoryDto[]>;
    addCategory(userId: string, categoryId: string): Promise<UserDto>;
    private validateManagerAssignment;
    private validateRoleChange;
    private checkUserAccess;
    private toUserDto;
}
