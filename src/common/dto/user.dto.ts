import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsDate,
  IsArray,
} from 'class-validator';
import { UserRole } from '../enums';
import { CategoryDto } from './category.dto';

export class UserDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  phone?: string;

  @Expose()
  @IsEnum(UserRole)
  role: UserRole;

  @Expose()
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Expose()
  @Type(() => UserDto)
  @IsOptional()
  manager?: UserDto;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Type(() => CategoryDto)
  @IsOptional()
  @IsArray()
  categories?: CategoryDto[];

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}

/**
 * DTO for assigning categories to a Customer Executive
 * Requirements: 5.1 - Assign multiple product categories to Customer Executives
 */
export class AssignCategoriesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  managerId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  managerId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
