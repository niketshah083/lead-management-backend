import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { FieldDefinition } from './field-definition.entity';

@Entity('business_types')
export class BusinessType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'pi-briefcase' })
  icon: string;

  @Column({ default: '#3B82F6' })
  color: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => FieldDefinition, (field) => field.businessType)
  fields: FieldDefinition[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
