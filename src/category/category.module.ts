import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';
import { CategoryMedia } from '../entities/category-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, CategoryMedia]),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
