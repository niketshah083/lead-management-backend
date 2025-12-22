import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDate,
  IsEnum,
  IsArray,
} from 'class-validator';
import { LeadStatus } from '../enums';
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
  @IsEnum(LeadStatus)
  status: LeadStatus;

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
  @IsEnum(LeadStatus, { each: true })
  status?: LeadStatus[];

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
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
