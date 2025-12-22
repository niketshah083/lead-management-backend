import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { LeadStatusMaster } from './lead-status-master.entity';

@Entity('status_transitions')
@Unique(['fromStatusId', 'toStatusId'])
export class StatusTransition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_status_id' })
  fromStatusId: string;

  @ManyToOne(() => LeadStatusMaster)
  @JoinColumn({ name: 'from_status_id' })
  fromStatus: LeadStatusMaster;

  @Column({ name: 'to_status_id' })
  toStatusId: string;

  @ManyToOne(() => LeadStatusMaster)
  @JoinColumn({ name: 'to_status_id' })
  toStatus: LeadStatusMaster;

  @Column({ default: true })
  isActive: boolean;

  // Optional: require comment when transitioning
  @Column({ default: false })
  requiresComment: boolean;

  // Optional: require specific role to make this transition
  @Column({ type: 'json', nullable: true })
  allowedRoles: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
