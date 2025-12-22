import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from './lead.entity';

@Entity('lead_contacts')
export class LeadContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.contacts)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column()
  name: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
