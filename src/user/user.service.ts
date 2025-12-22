import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { UserCategory } from '../entities/user-category.entity';
import { UserRole } from '../common/enums';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  AssignCategoriesDto,
} from '../common/dto/user.dto';
import { CategoryDto } from '../common/dto/category.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(UserCategory)
    private userCategoryRepository: Repository<UserCategory>,
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate manager assignment
    if (createUserDto.managerId) {
      await this.validateManagerAssignment(
        createUserDto.role,
        createUserDto.managerId,
      );
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash,
      name: createUserDto.name,
      phone: createUserDto.phone,
      role: createUserDto.role,
      managerId: createUserDto.managerId,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);
    return this.toUserDto(savedUser);
  }

  async findAll(currentUser: User): Promise<UserDto[]> {
    let users: User[];

    switch (currentUser.role) {
      case UserRole.ADMIN:
        // Admin sees all users
        users = await this.userRepository.find({
          relations: ['manager', 'categories'],
          order: { createdAt: 'DESC' },
        });
        break;

      case UserRole.MANAGER:
        // Manager sees themselves and their team (CEs under them)
        users = await this.userRepository.find({
          where: [{ id: currentUser.id }, { managerId: currentUser.id }],
          relations: ['manager', 'categories'],
          order: { createdAt: 'DESC' },
        });
        break;

      case UserRole.CUSTOMER_EXECUTIVE:
        // CE sees only themselves
        users = await this.userRepository.find({
          where: { id: currentUser.id },
          relations: ['manager', 'categories'],
        });
        break;

      default:
        users = [];
    }

    return users.map((user) => this.toUserDto(user));
  }

  async findOne(id: string, currentUser: User): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['manager', 'subordinates'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check access permissions
    this.checkUserAccess(user, currentUser);

    return this.toUserDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Only Admin can update users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admin can update users');
    }

    // Validate manager assignment if being updated
    if (updateUserDto.managerId !== undefined) {
      const targetRole = updateUserDto.role || user.role;
      if (updateUserDto.managerId) {
        await this.validateManagerAssignment(
          targetRole,
          updateUserDto.managerId,
        );
      }
    }

    // Prevent role change that would break hierarchy
    if (updateUserDto.role && updateUserDto.role !== user.role) {
      await this.validateRoleChange(user, updateUserDto.role);
    }

    Object.assign(user, updateUserDto);
    const savedUser = await this.userRepository.save(user);
    return this.toUserDto(savedUser);
  }

  async deactivate(id: string, currentUser: User): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Only Admin can deactivate users
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only Admin can deactivate users');
    }

    // Prevent self-deactivation
    if (user.id === currentUser.id) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    user.isActive = false;
    await this.userRepository.save(user);
  }

  async assignManager(ceId: string, managerId: string): Promise<UserDto> {
    const ce = await this.userRepository.findOne({
      where: { id: ceId },
    });

    if (!ce) {
      throw new NotFoundException(
        `Customer Executive with ID ${ceId} not found`,
      );
    }

    if (ce.role !== UserRole.CUSTOMER_EXECUTIVE) {
      throw new BadRequestException(
        'Only Customer Executives can be assigned to Managers',
      );
    }

    if (!ce.isActive) {
      throw new BadRequestException(
        'Cannot assign inactive Customer Executive to a Manager',
      );
    }

    const manager = await this.userRepository.findOne({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    if (manager.role !== UserRole.MANAGER) {
      throw new BadRequestException('Target user must have Manager role');
    }

    if (!manager.isActive) {
      throw new BadRequestException('Cannot assign to inactive Manager');
    }

    ce.managerId = managerId;
    const savedUser = await this.userRepository.save(ce);
    return this.toUserDto(savedUser);
  }

  async unassignManager(ceId: string): Promise<UserDto> {
    const ce = await this.userRepository.findOne({
      where: { id: ceId },
    });

    if (!ce) {
      throw new NotFoundException(
        `Customer Executive with ID ${ceId} not found`,
      );
    }

    if (ce.role !== UserRole.CUSTOMER_EXECUTIVE) {
      throw new BadRequestException(
        'Only Customer Executives can be unassigned from Managers',
      );
    }

    ce.managerId = null;
    const savedUser = await this.userRepository.save(ce);
    return this.toUserDto(savedUser);
  }

  async getTeamMembers(managerId: string): Promise<UserDto[]> {
    const manager = await this.userRepository.findOne({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    if (manager.role !== UserRole.MANAGER) {
      throw new BadRequestException('User is not a Manager');
    }

    const teamMembers = await this.userRepository.find({
      where: { managerId },
      relations: ['manager'],
      order: { createdAt: 'DESC' },
    });

    return teamMembers.map((user) => this.toUserDto(user));
  }

  /**
   * Assign categories to a Customer Executive
   * Requirements: 5.1 - Store the many-to-many relationship
   * Requirements: 5.4 - Validate that the Customer Executive is active
   * Requirements: 14.5 - Transaction atomicity for multi-table operations
   */
  async assignCategories(
    userId: string,
    assignCategoriesDto: AssignCategoriesDto,
  ): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Only Customer Executives can have categories assigned
    if (user.role !== UserRole.CUSTOMER_EXECUTIVE) {
      throw new BadRequestException(
        'Only Customer Executives can have categories assigned',
      );
    }

    // Requirements 5.4: Validate that the Customer Executive is active
    if (!user.isActive) {
      throw new BadRequestException(
        'Cannot assign categories to an inactive Customer Executive',
      );
    }

    // Validate all categories exist and are active
    const categories = await this.categoryRepository.find({
      where: {
        id: In(assignCategoriesDto.categoryIds),
        deletedAt: IsNull(),
      },
    });

    if (categories.length !== assignCategoriesDto.categoryIds.length) {
      const foundIds = categories.map((c) => c.id);
      const missingIds = assignCategoriesDto.categoryIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new NotFoundException(
        `Categories not found or inactive: ${missingIds.join(', ')}`,
      );
    }

    // Use transaction for atomicity (Requirements 14.5)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Clear existing category assignments
      await queryRunner.manager.delete(UserCategory, { userId });

      // Create new category assignments
      const userCategories = categories.map((category) => {
        return queryRunner.manager.create(UserCategory, {
          userId,
          categoryId: category.id,
        });
      });

      await queryRunner.manager.save(userCategories);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Reload user with categories
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories', 'manager'],
    });

    return this.toUserDto(updatedUser!);
  }

  /**
   * Remove a category from a Customer Executive
   * Requirements: 5.2 - Prevent new lead assignments for that category to that executive
   */
  async removeCategory(userId: string, categoryId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== UserRole.CUSTOMER_EXECUTIVE) {
      throw new BadRequestException(
        'Only Customer Executives can have categories removed',
      );
    }

    const userCategory = await this.userCategoryRepository.findOne({
      where: { userId, categoryId },
    });

    if (!userCategory) {
      throw new NotFoundException(
        `Category ${categoryId} is not assigned to user ${userId}`,
      );
    }

    await this.userCategoryRepository.remove(userCategory);

    // Reload user with categories
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories', 'manager'],
    });

    return this.toUserDto(updatedUser!);
  }

  /**
   * Get all categories assigned to a Customer Executive
   * Requirements: 5.3 - Display all assigned categories
   */
  async getUserCategories(userId: string): Promise<CategoryDto[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user.categories.map((category) =>
      plainToInstance(CategoryDto, category, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Add a single category to a Customer Executive
   * Requirements: 5.1, 5.4
   */
  async addCategory(userId: string, categoryId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== UserRole.CUSTOMER_EXECUTIVE) {
      throw new BadRequestException(
        'Only Customer Executives can have categories assigned',
      );
    }

    // Requirements 5.4: Validate that the Customer Executive is active
    if (!user.isActive) {
      throw new BadRequestException(
        'Cannot assign categories to an inactive Customer Executive',
      );
    }

    // Check if category exists and is active
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, deletedAt: IsNull() },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${categoryId} not found or inactive`,
      );
    }

    // Check if already assigned
    const existingAssignment = await this.userCategoryRepository.findOne({
      where: { userId, categoryId },
    });

    if (existingAssignment) {
      throw new ConflictException(
        `Category ${categoryId} is already assigned to user ${userId}`,
      );
    }

    // Create new assignment
    const userCategory = this.userCategoryRepository.create({
      userId,
      categoryId,
    });

    await this.userCategoryRepository.save(userCategory);

    // Reload user with categories
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['categories', 'manager'],
    });

    return this.toUserDto(updatedUser!);
  }

  private async validateManagerAssignment(
    userRole: UserRole,
    managerId: string,
  ): Promise<void> {
    // Only CEs can have managers
    if (userRole !== UserRole.CUSTOMER_EXECUTIVE) {
      throw new BadRequestException(
        'Only Customer Executives can be assigned to Managers',
      );
    }

    const manager = await this.userRepository.findOne({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Manager with ID ${managerId} not found`);
    }

    if (manager.role !== UserRole.MANAGER) {
      throw new BadRequestException('Assigned manager must have Manager role');
    }

    if (!manager.isActive) {
      throw new BadRequestException('Cannot assign to inactive Manager');
    }
  }

  private async validateRoleChange(
    user: User,
    newRole: UserRole,
  ): Promise<void> {
    // If changing from Manager, ensure no CEs are assigned
    if (user.role === UserRole.MANAGER && newRole !== UserRole.MANAGER) {
      const subordinates = await this.userRepository.count({
        where: { managerId: user.id },
      });

      if (subordinates > 0) {
        throw new BadRequestException(
          'Cannot change role: Manager has assigned Customer Executives',
        );
      }
    }

    // If changing to CE, clear managerId if set (will need to be reassigned)
    if (newRole === UserRole.CUSTOMER_EXECUTIVE && user.managerId) {
      // This is fine, keep the manager
    }

    // If changing from CE to something else, clear managerId
    if (
      user.role === UserRole.CUSTOMER_EXECUTIVE &&
      newRole !== UserRole.CUSTOMER_EXECUTIVE
    ) {
      user.managerId = null;
    }
  }

  private checkUserAccess(targetUser: User, currentUser: User): void {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        // Admin can access all users
        return;

      case UserRole.MANAGER:
        // Manager can access themselves and their team
        if (
          targetUser.id === currentUser.id ||
          targetUser.managerId === currentUser.id
        ) {
          return;
        }
        throw new ForbiddenException('Access denied');

      case UserRole.CUSTOMER_EXECUTIVE:
        // CE can only access themselves
        if (targetUser.id === currentUser.id) {
          return;
        }
        throw new ForbiddenException('Access denied');

      default:
        throw new ForbiddenException('Access denied');
    }
  }

  private toUserDto(user: User): UserDto {
    const dto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    // Map categories if present
    if (user.categories) {
      dto.categories = user.categories.map((category) =>
        plainToInstance(CategoryDto, category, {
          excludeExtraneousValues: true,
        }),
      );
    }

    return dto;
  }
}
