import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationChannel, NotificationStatus } from '../common/enums';
import { NotificationConfig } from './notification-config.entity';
import { User } from './user.entity';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'config_id', nullable: true })
  configId: string;

  @ManyToOne(() => NotificationConfig)
  @JoinColumn({ name: 'config_id' })
  config: NotificationConfig;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}
