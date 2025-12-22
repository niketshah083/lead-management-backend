import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MediaType } from '../common/enums';
import { Category } from './category.entity';

@Entity('category_media')
export class CategoryMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.media)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column()
  filename: string;

  @Column()
  size: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
