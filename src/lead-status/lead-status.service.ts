import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { LeadStatusMaster, StatusTransition } from '../entities';
import {
  CreateLeadStatusDto,
  UpdateLeadStatusDto,
  CreateStatusTransitionDto,
  UpdateStatusTransitionDto,
  BulkCreateTransitionsDto,
} from './dto';

@Injectable()
export class LeadStatusService {
  private readonly logger = new Logger(LeadStatusService.name);

  constructor(
    @InjectRepository(LeadStatusMaster)
    private readonly statusRepository: Repository<LeadStatusMaster>,
    @InjectRepository(StatusTransition)
    private readonly transitionRepository: Repository<StatusTransition>,
  ) {}

  async findAll(): Promise<LeadStatusMaster[]> {
    return this.statusRepository.find({
      where: { deletedAt: IsNull() },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<LeadStatusMaster> {
    const status = await this.statusRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!status) {
      throw new NotFoundException(`Lead status with ID ${id} not found`);
    }

    return status;
  }

  async findInitialStatus(): Promise<LeadStatusMaster | null> {
    return this.statusRepository.findOne({
      where: { isInitial: true, isActive: true, deletedAt: IsNull() },
    });
  }

  async create(dto: CreateLeadStatusDto): Promise<LeadStatusMaster> {
    // If this is set as initial, unset other initial statuses
    if (dto.isInitial) {
      await this.statusRepository.update(
        { isInitial: true },
        { isInitial: false },
      );
    }

    const status = this.statusRepository.create(dto);
    const saved = await this.statusRepository.save(status);
    this.logger.log(`Created lead status: ${saved.name}`);
    return saved;
  }

  async update(
    id: string,
    dto: UpdateLeadStatusDto,
  ): Promise<LeadStatusMaster> {
    const status = await this.findOne(id);

    // If this is set as initial, unset other initial statuses
    if (dto.isInitial && !status.isInitial) {
      await this.statusRepository.update(
        { isInitial: true },
        { isInitial: false },
      );
    }

    Object.assign(status, dto);
    const updated = await this.statusRepository.save(status);
    this.logger.log(`Updated lead status: ${updated.name}`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const status = await this.findOne(id);
    await this.statusRepository.softRemove(status);
    this.logger.log(`Deleted lead status: ${status.name}`);
  }

  async reorder(statuses: { id: string; order: number }[]): Promise<void> {
    for (const item of statuses) {
      await this.statusRepository.update(item.id, { order: item.order });
    }
    this.logger.log('Reordered lead statuses');
  }

  // ============ Status Transition Methods ============

  async findAllTransitions(): Promise<StatusTransition[]> {
    return this.transitionRepository.find({
      relations: ['fromStatus', 'toStatus'],
      order: { fromStatus: { order: 'ASC' }, toStatus: { order: 'ASC' } },
    });
  }

  async findTransitionsFrom(fromStatusId: string): Promise<StatusTransition[]> {
    return this.transitionRepository.find({
      where: { fromStatusId, isActive: true },
      relations: ['toStatus'],
      order: { toStatus: { order: 'ASC' } },
    });
  }

  async findAllowedNextStatuses(
    fromStatusId: string,
    userRole?: string,
  ): Promise<LeadStatusMaster[]> {
    const transitions = await this.transitionRepository.find({
      where: { fromStatusId, isActive: true },
      relations: ['toStatus'],
    });

    return transitions
      .filter((t) => {
        // If no role restrictions, allow
        if (!t.allowedRoles || t.allowedRoles.length === 0) return true;
        // If user role is provided, check if allowed
        if (userRole) return t.allowedRoles.includes(userRole);
        return true;
      })
      .map((t) => t.toStatus)
      .filter((s) => s.isActive)
      .sort((a, b) => a.order - b.order);
  }

  async createTransition(
    dto: CreateStatusTransitionDto,
  ): Promise<StatusTransition> {
    // Verify both statuses exist
    await this.findOne(dto.fromStatusId);
    await this.findOne(dto.toStatusId);

    // Check if transition already exists
    const existing = await this.transitionRepository.findOne({
      where: { fromStatusId: dto.fromStatusId, toStatusId: dto.toStatusId },
    });

    if (existing) {
      // Update existing transition
      Object.assign(existing, dto);
      existing.isActive = true;
      return this.transitionRepository.save(existing);
    }

    const transition = this.transitionRepository.create(dto);
    const saved = await this.transitionRepository.save(transition);
    this.logger.log(
      `Created status transition: ${dto.fromStatusId} -> ${dto.toStatusId}`,
    );
    return saved;
  }

  async bulkCreateTransitions(
    dto: BulkCreateTransitionsDto,
  ): Promise<StatusTransition[]> {
    const results: StatusTransition[] = [];

    for (const toStatusId of dto.toStatusIds) {
      const transition = await this.createTransition({
        fromStatusId: dto.fromStatusId,
        toStatusId,
        requiresComment: dto.requiresComment,
      });
      results.push(transition);
    }

    return results;
  }

  async updateTransition(
    id: string,
    dto: UpdateStatusTransitionDto,
  ): Promise<StatusTransition> {
    const transition = await this.transitionRepository.findOne({
      where: { id },
    });

    if (!transition) {
      throw new NotFoundException(`Status transition with ID ${id} not found`);
    }

    Object.assign(transition, dto);
    const updated = await this.transitionRepository.save(transition);
    this.logger.log(`Updated status transition: ${id}`);
    return updated;
  }

  async deleteTransition(id: string): Promise<void> {
    const transition = await this.transitionRepository.findOne({
      where: { id },
    });

    if (!transition) {
      throw new NotFoundException(`Status transition with ID ${id} not found`);
    }

    await this.transitionRepository.remove(transition);
    this.logger.log(`Deleted status transition: ${id}`);
  }

  async isTransitionAllowed(
    fromStatusId: string,
    toStatusId: string,
    userRole?: string,
  ): Promise<{ allowed: boolean; requiresComment: boolean }> {
    const transition = await this.transitionRepository.findOne({
      where: { fromStatusId, toStatusId, isActive: true },
    });

    if (!transition) {
      return { allowed: false, requiresComment: false };
    }

    // Check role restrictions
    if (
      transition.allowedRoles &&
      transition.allowedRoles.length > 0 &&
      userRole
    ) {
      if (!transition.allowedRoles.includes(userRole)) {
        return { allowed: false, requiresComment: false };
      }
    }

    return { allowed: true, requiresComment: transition.requiresComment };
  }
}
