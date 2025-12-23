import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SetCustomFieldValueDto {
  @IsUUID()
  fieldDefinitionId: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  arrayValue?: string[];
}

export class BulkSetCustomFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetCustomFieldValueDto)
  fields: SetCustomFieldValueDto[];
}
