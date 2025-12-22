import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeadStatus } from '../common/enums';
import { Lead } from './lead.entity';
import { User } from './user.entity';

@Entity('lead_history')
export class LeadHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.history)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: LeadStatus,
    nullable: true,
  })
  previousStatus: LeadStatus;

  @Column({ name: 'new_status', type: 'enum', enum: LeadStatus })
  newStatus: LeadStatus;

  @Column({ name: 'changed_by_id' })
  changedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
