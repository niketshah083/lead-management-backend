import { IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class BulkCreateTransitionsDto {
  @IsUUID()
  fromStatusId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  toStatusIds: string[];

  @IsOptional()
  @IsBoolean()
  requiresComment?: boolean;
}
