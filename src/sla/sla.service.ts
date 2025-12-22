import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlaPolicy, SlaTracking, Lead } from '../entities';
import { LeadStatus } from '../common/enums';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from './dto';

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(
    @InjectRepository(SlaPolicy)
    private readonly policyRepository: Repository<SlaPolicy>,
    @InjectRepository(SlaTracking)
    private readonly trackingRepository: Repository<SlaTracking>,
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  // Policy Management

  async createPolicy(dto: CreateSlaPolicyDto): Promise<SlaPolicy> {
    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.policyRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }

    const policy = this.policyRepository.create({
      name: dto.name,
      firstResponseMinutes: dto.firstResponseMinutes,
      followUpMinutes: dto.followUpMinutes ?? dto.firstResponseMinutes * 2,
      resolutionMinutes: dto.resolutionMinutes,
      warningThresholdPercent: dto.warningThresholdPercent ?? 80,
      isDefault: dto.isDefault ?? false,
      isActive: true,
    });

    const savedPolicy = await this.policyRepository.save(policy);
    this.logger.log(
      `Created SLA policy ${savedPolicy.id}: ${savedPolicy.name}`,
    );
    return savedPolicy;
  }

  async updatePolicy(id: string, dto: UpdateSlaPolicyDto): Promise<SlaPolicy> {
    const policy = await this.findPolicyById(id);

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.policyRepository.update(
        { isDefault: true, id: { $ne: id } as any },
        { isDefault: false },
      );
    }

    Object.assign(policy, dto);
    const savedPolicy = await this.policyRepository.save(policy);
    this.logger.log(`Updated SLA policy ${id}`);
    return savedPolicy;
  }

  async findPolicyById(id: string): Promise<SlaPolicy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`SLA policy with ID ${id} not found`);
    }
    return policy;
  }

  async findAllPolicies(): Promise<SlaPolicy[]> {
    return this.policyRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getDefaultPolicy(): Promise<SlaPolicy | null> {
    return this.policyRepository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  // SLA Tracking

  async initializeSlaTracking(
    leadId: string,
    policyId?: string,
  ): Promise<SlaTracking> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    // Get policy (use provided or default)
    let policy: SlaPolicy | null = null;
    if (policyId) {
      policy = await this.findPolicyById(policyId);
    } else {
      policy = await this.getDefaultPolicy();
    }

    if (!policy) {
      throw new BadRequestException('No SLA policy available');
    }

    const now = new Date();
    const firstResponseDue = new Date(
      now.getTime() + policy.firstResponseMinutes * 60 * 1000,
    );
    const resolutionDue = new Date(
      now.getTime() + policy.resolutionMinutes * 60 * 1000,
    );

    const tracking = this.trackingRepository.create({
      leadId,
      policyId: policy.id,
      firstResponseDue,
      resolutionDue,
      firstResponseBreached: false,
      resolutionBreached: false,
    });

    const savedTracking = await this.trackingRepository.save(tracking);
    this.logger.log(`Initialized SLA tracking for lead ${leadId}`);
    return savedTracking;
  }

  async recordFirstResponse(leadId: string): Promise<SlaTracking> {
    const tracking = await this.findTrackingByLeadId(leadId);

    if (tracking.firstResponseAt) {
      // Already recorded
      return tracking;
    }

    const now = new Date();
    tracking.firstResponseAt = now;
    tracking.firstResponseBreached = now > tracking.firstResponseDue;

    const savedTracking = await this.trackingRepository.save(tracking);
    this.logger.log(
      `Recorded first response for lead ${leadId}, breached: ${tracking.firstResponseBreached}`,
    );
    return savedTracking;
  }

  async recordResolution(leadId: string): Promise<SlaTracking> {
    const tracking = await this.findTrackingByLeadId(leadId);

    const now = new Date();
    tracking.resolvedAt = now;
    tracking.resolutionBreached = now > tracking.resolutionDue;

    const savedTracking = await this.trackingRepository.save(tracking);
    this.logger.log(
      `Recorded resolution for lead ${leadId}, breached: ${tracking.resolutionBreached}`,
    );
    return savedTracking;
  }

  async findTrackingByLeadId(leadId: string): Promise<SlaTracking> {
    const tracking = await this.trackingRepository.findOne({
      where: { leadId },
      relations: ['policy'],
    });

    if (!tracking) {
      throw new NotFoundException(`SLA tracking for lead ${leadId} not found`);
    }

    return tracking;
  }

  async getSlaStatus(leadId: string): Promise<{
    tracking: SlaTracking;
    currentStatus: 'on_track' | 'warning' | 'breached';
    timeRemaining: number;
  }> {
    const tracking = await this.findTrackingByLeadId(leadId);
    const policy =
      tracking.policy || (await this.findPolicyById(tracking.policyId));

    const now = new Date();
    let currentStatus: 'on_track' | 'warning' | 'breached' = 'on_track';
    let timeRemaining = 0;

    // Check first response SLA
    if (!tracking.firstResponseAt) {
      timeRemaining = tracking.firstResponseDue.getTime() - now.getTime();

      if (now > tracking.firstResponseDue) {
        currentStatus = 'breached';
      } else {
        const totalTime =
          tracking.firstResponseDue.getTime() - tracking.createdAt.getTime();
        const elapsed = now.getTime() - tracking.createdAt.getTime();
        const percentElapsed = (elapsed / totalTime) * 100;

        if (percentElapsed >= policy.warningThresholdPercent) {
          currentStatus = 'warning';
        }
      }
    } else if (!tracking.resolvedAt) {
      // Check resolution SLA
      timeRemaining = tracking.resolutionDue.getTime() - now.getTime();

      if (now > tracking.resolutionDue) {
        currentStatus = 'breached';
      } else {
        const totalTime =
          tracking.resolutionDue.getTime() - tracking.createdAt.getTime();
        const elapsed = now.getTime() - tracking.createdAt.getTime();
        const percentElapsed = (elapsed / totalTime) * 100;

        if (percentElapsed >= policy.warningThresholdPercent) {
          currentStatus = 'warning';
        }
      }
    }

    return { tracking, currentStatus, timeRemaining };
  }

  async getLeadsApproachingBreach(): Promise<SlaTracking[]> {
    const now = new Date();

    // Get all active SLA trackings
    const trackings = await this.trackingRepository
      .createQueryBuilder('tracking')
      .leftJoinAndSelect('tracking.policy', 'policy')
      .leftJoinAndSelect('tracking.lead', 'lead')
      .where('tracking.resolvedAt IS NULL')
      .andWhere('lead.status NOT IN (:...closedStatuses)', {
        closedStatuses: [LeadStatus.WON, LeadStatus.LOST],
      })
      .getMany();

    return trackings.filter((tracking) => {
      const policy = tracking.policy;
      const warningThreshold = policy.warningThresholdPercent / 100;

      if (!tracking.firstResponseAt) {
        const totalTime =
          tracking.firstResponseDue.getTime() - tracking.createdAt.getTime();
        const elapsed = now.getTime() - tracking.createdAt.getTime();
        return elapsed / totalTime >= warningThreshold;
      }

      const totalTime =
        tracking.resolutionDue.getTime() - tracking.createdAt.getTime();
      const elapsed = now.getTime() - tracking.createdAt.getTime();
      return elapsed / totalTime >= warningThreshold;
    });
  }

  async getBreachedLeads(): Promise<SlaTracking[]> {
    const now = new Date();

    return this.trackingRepository
      .createQueryBuilder('tracking')
      .leftJoinAndSelect('tracking.policy', 'policy')
      .leftJoinAndSelect('tracking.lead', 'lead')
      .where('tracking.resolvedAt IS NULL')
      .andWhere(
        '((tracking.firstResponseAt IS NULL AND tracking.firstResponseDue < :now) OR ' +
          '(tracking.firstResponseAt IS NOT NULL AND tracking.resolutionDue < :now))',
        { now },
      )
      .getMany();
  }
}
