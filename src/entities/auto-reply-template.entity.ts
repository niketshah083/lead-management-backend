import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('auto_reply_templates')
export class AutoReplyTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.autoReplyTemplates)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'trigger_keyword' })
  triggerKeyword: string;

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
