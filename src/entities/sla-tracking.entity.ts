import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from './lead.entity';
import { SlaPolicy } from './sla-policy.entity';

@Entity('sla_tracking')
export class SlaTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @OneToOne(() => Lead, (lead) => lead.slaTracking)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'policy_id' })
  policyId: string;

  @ManyToOne(() => SlaPolicy)
  @JoinColumn({ name: 'policy_id' })
  policy: SlaPolicy;

  @Column({ name: 'first_response_due' })
  firstResponseDue: Date;

  @Column({ name: 'first_response_at', nullable: true })
  firstResponseAt: Date;

  @Column({ name: 'first_response_breached', default: false })
  firstResponseBreached: boolean;

  @Column({ name: 'resolution_due' })
  resolutionDue: Date;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolution_breached', default: false })
  resolutionBreached: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
