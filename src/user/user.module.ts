import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { UserCategory } from '../entities/user-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, UserCategory])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
