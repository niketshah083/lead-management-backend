import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationEventType } from '../common/enums';

@Entity('notification_configs')
export class NotificationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', type: 'enum', enum: NotificationEventType })
  eventType: NotificationEventType;

  @Column({ name: 'email_enabled', default: true })
  emailEnabled: boolean;

  @Column({ name: 'push_enabled', default: true })
  pushEnabled: boolean;

  @Column({ name: 'recipient_roles', type: 'json' })
  recipientRoles: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
