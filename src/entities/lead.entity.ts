import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { LeadStatus } from '../common/enums';
import { Category } from './category.entity';
import { User } from './user.entity';
import { Message } from './message.entity';
import { SlaTracking } from './sla-tracking.entity';
import { LeadHistory } from './lead-history.entity';
import { LeadContact } from './lead-contact.entity';
import { LeadStatusMaster } from './lead-status-master.entity';
import { BusinessType } from './business-type.entity';
import { LeadCustomField } from './lead-custom-field.entity';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ nullable: true })
  source: string;

  // Business Address fields
  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.NEW })
  status: LeadStatus;

  @Column({ name: 'status_master_id', nullable: true })
  statusMasterId: string;

  @ManyToOne(() => LeadStatusMaster)
  @JoinColumn({ name: 'status_master_id' })
  statusMaster: LeadStatusMaster;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ name: 'claimed_at', nullable: true })
  claimedAt: Date;

  @Column({ name: 'is_qualified', default: false })
  isQualified: boolean;

  @OneToMany(() => Message, (message) => message.lead)
  messages: Message[];

  @OneToOne(() => SlaTracking, (sla) => sla.lead)
  slaTracking: SlaTracking;

  @OneToMany(() => LeadHistory, (history) => history.lead)
  history: LeadHistory[];

  @OneToMany(() => LeadContact, (contact) => contact.lead)
  contacts: LeadContact[];

  // Business Type for custom fields
  @Column({ name: 'business_type_id', nullable: true })
  businessTypeId?: string;

  @ManyToOne(() => BusinessType)
  @JoinColumn({ name: 'business_type_id' })
  businessType: BusinessType;

  // Custom field values
  @OneToMany(() => LeadCustomField, (cf) => cf.lead)
  customFields: LeadCustomField[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
