import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Lead, User } from '../../entities';
import { UserRole } from '../../common/enums';

@Injectable()
export class LeadVisibilityService {
  private readonly logger = new Logger(LeadVisibilityService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  /**
   * Apply role-based visibility filter to lead query
   * - Admin: sees all leads
   * - Manager: sees leads assigned to their team members or unassigned
   * - CE: sees leads assigned to them or unassigned leads in their categories
   */
  async applyVisibilityFilter(
    query: SelectQueryBuilder<Lead>,
    currentUser: User,
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      // Admin sees all leads - no filter needed
      this.logger.debug(`Admin ${currentUser.id} has full access`);
      return;
    }

    if (currentUser.role === UserRole.MANAGER) {
      // Manager sees leads assigned to their team
      const teamMembers = await this.getTeamMembers(currentUser.id);
      const teamIds = [currentUser.id, ...teamMembers.map((m) => m.id)];

      query.andWhere(
        '(lead.assignedToId IN (:...teamIds) OR lead.assignedToId IS NULL)',
        { teamIds },
      );
      this.logger.debug(
        `Manager ${currentUser.id} filtered to team: ${teamIds.join(', ')}`,
      );
      return;
    }

    // Customer Executive
    const userWithCategories = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: ['categories'],
    });

    const categoryIds = userWithCategories?.categories?.map((c) => c.id) || [];

    if (categoryIds.length > 0) {
      query.andWhere(
        '(lead.assignedToId = :userId OR (lead.assignedToId IS NULL AND lead.categoryId IN (:...categoryIds)))',
        { userId: currentUser.id, categoryIds },
      );
    } else {
      query.andWhere('lead.assignedToId = :userId', {
        userId: currentUser.id,
      });
    }
    this.logger.debug(
      `CE ${currentUser.id} filtered to assigned leads and categories: ${categoryIds.join(', ')}`,
    );
  }

  /**
   * Check if a user can access a specific lead
   */
  async canAccessLead(lead: Lead, user: User): Promise<boolean> {
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.MANAGER) {
      if (!lead.assignedToId) {
        return true; // Unassigned leads visible to managers
      }
      // Check if assigned user is in manager's team
      const teamMembers = await this.getTeamMembers(user.id);
      const teamIds = [user.id, ...teamMembers.map((m) => m.id)];
      return teamIds.includes(lead.assignedToId);
    }

    // Customer Executive
    if (lead.assignedToId === user.id) {
      return true;
    }

    if (!lead.assignedToId) {
      // Check if lead's category is assigned to this CE
      const userWithCategories = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['categories'],
      });
      const categoryIds =
        userWithCategories?.categories?.map((c) => c.id) || [];
      return lead.categoryId ? categoryIds.includes(lead.categoryId) : false;
    }

    return false;
  }

  /**
   * Get all team members for a manager
   */
  async getTeamMembers(managerId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { managerId, isActive: true },
      select: ['id', 'name', 'email', 'role'],
    });
  }

  /**
   * Get eligible CEs for a lead based on category assignment
   */
  async getEligibleCEsForLead(lead: Lead): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.categories', 'category')
      .where('category.id = :categoryId', { categoryId: lead.categoryId })
      .andWhere('user.role = :role', { role: UserRole.CUSTOMER_EXECUTIVE })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();

    return users;
  }

  /**
   * Get all leads visible to a user
   */
  async getVisibleLeads(user: User): Promise<Lead[]> {
    const query = this.leadRepository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.category', 'category')
      .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
      .where('lead.deletedAt IS NULL');

    await this.applyVisibilityFilter(query, user);

    return query.orderBy('lead.createdAt', 'DESC').getMany();
  }
}
