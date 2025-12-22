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
import { Lead } from './lead.entity';
import { FieldDefinition } from './field-definition.entity';

@Entity('lead_custom_fields')
@Unique(['leadId', 'fieldDefinitionId'])
export class LeadCustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @ManyToOne(() => Lead, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ name: 'field_definition_id' })
  fieldDefinitionId: string;

  @ManyToOne(() => FieldDefinition)
  @JoinColumn({ name: 'field_definition_id' })
  fieldDefinition: FieldDefinition;

  // Store value as text - will be parsed based on field type
  @Column({ type: 'text', nullable: true })
  value?: string;

  // For multi-select fields, store as JSON array
  @Column({ type: 'json', nullable: true })
  arrayValue?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
