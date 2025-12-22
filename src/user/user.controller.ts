import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  AssignCategoriesDto,
} from '../common/dto/user.dto';
import { CategoryDto } from '../common/dto/category.dto';
import { User } from '../entities/user.entity';
import { CurrentUser, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { UserRole } from '../common/enums';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(@CurrentUser() currentUser: User): Promise<UserDto[]> {
    return this.userService.findAll(currentUser);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserDto> {
    return this.userService.findOne(id, currentUser);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserDto> {
    return this.userService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    return this.userService.deactivate(id, currentUser);
  }

  @Post(':ceId/assign-manager/:managerId')
  @Roles(UserRole.ADMIN)
  async assignManager(
    @Param('ceId', ParseUUIDPipe) ceId: string,
    @Param('managerId', ParseUUIDPipe) managerId: string,
  ): Promise<UserDto> {
    return this.userService.assignManager(ceId, managerId);
  }

  @Delete(':ceId/unassign-manager')
  @Roles(UserRole.ADMIN)
  async unassignManager(
    @Param('ceId', ParseUUIDPipe) ceId: string,
  ): Promise<UserDto> {
    return this.userService.unassignManager(ceId);
  }

  @Get('manager/:managerId/team')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async getTeamMembers(
    @Param('managerId', ParseUUIDPipe) managerId: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserDto[]> {
    // Managers can only view their own team
    if (currentUser.role === UserRole.MANAGER && currentUser.id !== managerId) {
      return [];
    }
    return this.userService.getTeamMembers(managerId);
  }

  /**
   * Assign multiple categories to a Customer Executive
   * Requirements: 5.1 - Store the many-to-many relationship
   * Requirements: 5.4 - Validate that the Customer Executive is active
   */
  @Put(':userId/categories')
  @Roles(UserRole.ADMIN)
  async assignCategories(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() assignCategoriesDto: AssignCategoriesDto,
  ): Promise<UserDto> {
    return this.userService.assignCategories(userId, assignCategoriesDto);
  }

  /**
   * Add a single category to a Customer Executive
   * Requirements: 5.1, 5.4
   */
  @Post(':userId/categories/:categoryId')
  @Roles(UserRole.ADMIN)
  async addCategory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<UserDto> {
    return this.userService.addCategory(userId, categoryId);
  }

  /**
   * Remove a category from a Customer Executive
   * Requirements: 5.2 - Prevent new lead assignments for that category
   */
  @Delete(':userId/categories/:categoryId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeCategory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<UserDto> {
    return this.userService.removeCategory(userId, categoryId);
  }

  /**
   * Get all categories assigned to a Customer Executive
   * Requirements: 5.3 - Display all assigned categories
   */
  @Get(':userId/categories')
  async getUserCategories(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<CategoryDto[]> {
    return this.userService.getUserCategories(userId);
  }
}
