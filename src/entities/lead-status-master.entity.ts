import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('lead_status_masters')
export class LeadStatusMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @Column({ default: '#EFF6FF' })
  bgColor: string;

  @Column({ default: 'pi-inbox' })
  icon: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  // Is this the initial status for new leads?
  @Column({ default: false })
  isInitial: boolean;

  // Is this a final status (Won, Lost, etc.)?
  @Column({ default: false })
  isFinal: boolean;

  // Status type for categorization
  @Column({ nullable: true })
  statusType: string; // 'positive', 'negative', 'neutral'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
