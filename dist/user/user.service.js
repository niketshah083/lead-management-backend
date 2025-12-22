"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const category_entity_1 = require("../entities/category.entity");
const user_category_entity_1 = require("../entities/user-category.entity");
const enums_1 = require("../common/enums");
const user_dto_1 = require("../common/dto/user.dto");
const category_dto_1 = require("../common/dto/category.dto");
const class_transformer_1 = require("class-transformer");
let UserService = class UserService {
    userRepository;
    categoryRepository;
    userCategoryRepository;
    dataSource;
    constructor(userRepository, categoryRepository, userCategoryRepository, dataSource) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.userCategoryRepository = userCategoryRepository;
        this.dataSource = dataSource;
    }
    async create(createUserDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (createUserDto.managerId) {
            await this.validateManagerAssignment(createUserDto.role, createUserDto.managerId);
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
    async findAll(currentUser) {
        let users;
        switch (currentUser.role) {
            case enums_1.UserRole.ADMIN:
                users = await this.userRepository.find({
                    relations: ['manager', 'categories'],
                    order: { createdAt: 'DESC' },
                });
                break;
            case enums_1.UserRole.MANAGER:
                users = await this.userRepository.find({
                    where: [{ id: currentUser.id }, { managerId: currentUser.id }],
                    relations: ['manager', 'categories'],
                    order: { createdAt: 'DESC' },
                });
                break;
            case enums_1.UserRole.CUSTOMER_EXECUTIVE:
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
    async findOne(id, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['manager', 'subordinates'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        this.checkUserAccess(user, currentUser);
        return this.toUserDto(user);
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['manager'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (currentUser.role !== enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only Admin can update users');
        }
        if (updateUserDto.managerId !== undefined) {
            const targetRole = updateUserDto.role || user.role;
            if (updateUserDto.managerId) {
                await this.validateManagerAssignment(targetRole, updateUserDto.managerId);
            }
        }
        if (updateUserDto.role && updateUserDto.role !== user.role) {
            await this.validateRoleChange(user, updateUserDto.role);
        }
        Object.assign(user, updateUserDto);
        const savedUser = await this.userRepository.save(user);
        return this.toUserDto(savedUser);
    }
    async deactivate(id, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (currentUser.role !== enums_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only Admin can deactivate users');
        }
        if (user.id === currentUser.id) {
            throw new common_1.BadRequestException('Cannot deactivate your own account');
        }
        user.isActive = false;
        await this.userRepository.save(user);
    }
    async assignManager(ceId, managerId) {
        const ce = await this.userRepository.findOne({
            where: { id: ceId },
        });
        if (!ce) {
            throw new common_1.NotFoundException(`Customer Executive with ID ${ceId} not found`);
        }
        if (ce.role !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            throw new common_1.BadRequestException('Only Customer Executives can be assigned to Managers');
        }
        if (!ce.isActive) {
            throw new common_1.BadRequestException('Cannot assign inactive Customer Executive to a Manager');
        }
        const manager = await this.userRepository.findOne({
            where: { id: managerId },
        });
        if (!manager) {
            throw new common_1.NotFoundException(`Manager with ID ${managerId} not found`);
        }
        if (manager.role !== enums_1.UserRole.MANAGER) {
            throw new common_1.BadRequestException('Target user must have Manager role');
        }
        if (!manager.isActive) {
            throw new common_1.BadRequestException('Cannot assign to inactive Manager');
        }
        ce.managerId = managerId;
        const savedUser = await this.userRepository.save(ce);
        return this.toUserDto(savedUser);
    }
    async unassignManager(ceId) {
        const ce = await this.userRepository.findOne({
            where: { id: ceId },
        });
        if (!ce) {
            throw new common_1.NotFoundException(`Customer Executive with ID ${ceId} not found`);
        }
        if (ce.role !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            throw new common_1.BadRequestException('Only Customer Executives can be unassigned from Managers');
        }
        ce.managerId = null;
        const savedUser = await this.userRepository.save(ce);
        return this.toUserDto(savedUser);
    }
    async getTeamMembers(managerId) {
        const manager = await this.userRepository.findOne({
            where: { id: managerId },
        });
        if (!manager) {
            throw new common_1.NotFoundException(`Manager with ID ${managerId} not found`);
        }
        if (manager.role !== enums_1.UserRole.MANAGER) {
            throw new common_1.BadRequestException('User is not a Manager');
        }
        const teamMembers = await this.userRepository.find({
            where: { managerId },
            relations: ['manager'],
            order: { createdAt: 'DESC' },
        });
        return teamMembers.map((user) => this.toUserDto(user));
    }
    async assignCategories(userId, assignCategoriesDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.role !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            throw new common_1.BadRequestException('Only Customer Executives can have categories assigned');
        }
        if (!user.isActive) {
            throw new common_1.BadRequestException('Cannot assign categories to an inactive Customer Executive');
        }
        const categories = await this.categoryRepository.find({
            where: {
                id: (0, typeorm_2.In)(assignCategoriesDto.categoryIds),
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
        if (categories.length !== assignCategoriesDto.categoryIds.length) {
            const foundIds = categories.map((c) => c.id);
            const missingIds = assignCategoriesDto.categoryIds.filter((id) => !foundIds.includes(id));
            throw new common_1.NotFoundException(`Categories not found or inactive: ${missingIds.join(', ')}`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(user_category_entity_1.UserCategory, { userId });
            const userCategories = categories.map((category) => {
                return queryRunner.manager.create(user_category_entity_1.UserCategory, {
                    userId,
                    categoryId: category.id,
                });
            });
            await queryRunner.manager.save(userCategories);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        const updatedUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories', 'manager'],
        });
        return this.toUserDto(updatedUser);
    }
    async removeCategory(userId, categoryId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.role !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            throw new common_1.BadRequestException('Only Customer Executives can have categories removed');
        }
        const userCategory = await this.userCategoryRepository.findOne({
            where: { userId, categoryId },
        });
        if (!userCategory) {
            throw new common_1.NotFoundException(`Category ${categoryId} is not assigned to user ${userId}`);
        }
        await this.userCategoryRepository.remove(userCategory);
        const updatedUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories', 'manager'],
        });
        return this.toUserDto(updatedUser);
    }
    async getUserCategories(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return user.categories.map((category) => (0, class_transformer_1.plainToInstance)(category_dto_1.CategoryDto, category, {
            excludeExtraneousValues: true,
        }));
    }
    async addCategory(userId, categoryId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.role !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            throw new common_1.BadRequestException('Only Customer Executives can have categories assigned');
        }
        if (!user.isActive) {
            throw new common_1.BadRequestException('Cannot assign categories to an inactive Customer Executive');
        }
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId, deletedAt: (0, typeorm_2.IsNull)() },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found or inactive`);
        }
        const existingAssignment = await this.userCategoryRepository.findOne({
            where: { userId, categoryId },
        });
        if (existingAssignment) {
            throw new common_1.ConflictException(`Category ${categoryId} is already assigned to user ${userId}`);
        }
        const userCategory = this.userCategoryRepository.create({
            userId,
            categoryId,
        });
        await this.userCategoryRepository.save(userCategory);
        const updatedUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['categories', 'manager'],
        });
        return this.toUserDto(updatedUser);
    }
    async validateManagerAssignment(userRole, managerId) {
        if (userRole !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            throw new common_1.BadRequestException('Only Customer Executives can be assigned to Managers');
        }
        const manager = await this.userRepository.findOne({
            where: { id: managerId },
        });
        if (!manager) {
            throw new common_1.NotFoundException(`Manager with ID ${managerId} not found`);
        }
        if (manager.role !== enums_1.UserRole.MANAGER) {
            throw new common_1.BadRequestException('Assigned manager must have Manager role');
        }
        if (!manager.isActive) {
            throw new common_1.BadRequestException('Cannot assign to inactive Manager');
        }
    }
    async validateRoleChange(user, newRole) {
        if (user.role === enums_1.UserRole.MANAGER && newRole !== enums_1.UserRole.MANAGER) {
            const subordinates = await this.userRepository.count({
                where: { managerId: user.id },
            });
            if (subordinates > 0) {
                throw new common_1.BadRequestException('Cannot change role: Manager has assigned Customer Executives');
            }
        }
        if (newRole === enums_1.UserRole.CUSTOMER_EXECUTIVE && user.managerId) {
        }
        if (user.role === enums_1.UserRole.CUSTOMER_EXECUTIVE &&
            newRole !== enums_1.UserRole.CUSTOMER_EXECUTIVE) {
            user.managerId = null;
        }
    }
    checkUserAccess(targetUser, currentUser) {
        switch (currentUser.role) {
            case enums_1.UserRole.ADMIN:
                return;
            case enums_1.UserRole.MANAGER:
                if (targetUser.id === currentUser.id ||
                    targetUser.managerId === currentUser.id) {
                    return;
                }
                throw new common_1.ForbiddenException('Access denied');
            case enums_1.UserRole.CUSTOMER_EXECUTIVE:
                if (targetUser.id === currentUser.id) {
                    return;
                }
                throw new common_1.ForbiddenException('Access denied');
            default:
                throw new common_1.ForbiddenException('Access denied');
        }
    }
    toUserDto(user) {
        const dto = (0, class_transformer_1.plainToInstance)(user_dto_1.UserDto, user, {
            excludeExtraneousValues: true,
        });
        if (user.categories) {
            dto.categories = user.categories.map((category) => (0, class_transformer_1.plainToInstance)(category_dto_1.CategoryDto, category, {
                excludeExtraneousValues: true,
            }));
        }
        return dto;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(user_category_entity_1.UserCategory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], UserService);
//# sourceMappingURL=user.service.js.map