import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'first_response_minutes' })
  firstResponseMinutes: number;

  @Column({ name: 'follow_up_minutes' })
  followUpMinutes: number;

  @Column({ name: 'resolution_minutes' })
  resolutionMinutes: number;

  @Column({ name: 'warning_threshold_percent', default: 80 })
  warningThresholdPercent: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
