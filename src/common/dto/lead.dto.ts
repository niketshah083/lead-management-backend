import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDate,
  IsArray,
} from 'class-validator';
import { CategoryDto } from './category.dto';
import { UserDto } from './user.dto';

export class LeadDto {
  @Expose()
  @IsUUID()
  id: string;

  @Expose()
  @IsString()
  phoneNumber: string;

  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  categoryId?: string | null;

  @Expose()
  @Type(() => CategoryDto)
  @IsOptional()
  category?: CategoryDto;

  @Expose()
  @IsString()
  status: string; // Dynamic status name from database

  @Expose()
  @IsOptional()
  @IsUUID()
  statusMasterId?: string;

  @Expose()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @Expose()
  @Type(() => UserDto)
  @IsOptional()
  assignedTo?: UserDto;

  @Expose()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  claimedAt?: Date;

  @Expose()
  @IsBoolean()
  isQualified: boolean;

  @Expose()
  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}

export class LeadFilterDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[]; // Dynamic status names

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;
}

export class UpdateLeadStatusDto {
  @IsOptional()
  @IsString()
  status?: string; // Dynamic status name

  @IsOptional()
  @IsUUID()
  statusMasterId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
