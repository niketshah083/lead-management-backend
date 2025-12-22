import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessType } from './business-type.entity';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DROPDOWN = 'dropdown',
  MULTI_SELECT = 'multi_select',
  CHECKBOX = 'checkbox',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  TEXTAREA = 'textarea',
  CURRENCY = 'currency',
}

@Entity('field_definitions')
export class FieldDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_type_id' })
  businessTypeId: string;

  @ManyToOne(() => BusinessType, (bt) => bt.fields)
  @JoinColumn({ name: 'business_type_id' })
  businessType: BusinessType;

  @Column()
  name: string;

  @Column()
  label: string;

  @Column({ type: 'enum', enum: FieldType, default: FieldType.TEXT })
  fieldType: FieldType;

  @Column({ nullable: true })
  placeholder: string;

  @Column({ nullable: true })
  helpText: string;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  // For dropdown/multi_select - JSON array of options
  @Column({ type: 'json', nullable: true })
  options: { label: string; value: string }[];

  // Validation rules as JSON
  @Column({ type: 'json', nullable: true })
  validation: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
  };

  // Default value
  @Column({ nullable: true })
  defaultValue: string;

  // For conditional visibility
  @Column({ type: 'json', nullable: true })
  visibilityCondition: {
    dependsOn?: string;
    showWhen?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
