import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateStatusTransitionDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}
