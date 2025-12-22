import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageDirection, MessageStatus, MediaType } from '../common/enums';
import { Lead } from './lead.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @ManyToOne(() => Lead, (lead) => lead.messages)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @Column('text')
  content: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl: string;

  @Column({ name: 'media_type', type: 'enum', enum: MediaType, nullable: true })
  mediaType: MediaType;

  @Column({ name: 'sent_by_id', nullable: true })
  sentById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sent_by_id' })
  sentBy: User;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.PENDING })
  status: MessageStatus;

  @Column({ name: 'is_auto_reply', default: false })
  isAutoReply: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
