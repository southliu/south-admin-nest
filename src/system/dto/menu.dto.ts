import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @IsString()
  label: string;

  @IsString()
  labelEn: string;

  @Type(() => Number)
  @IsInt()
  type: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  router?: string;

  @IsOptional()
  @IsString()
  rule?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  state?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  actions?: string[];
}

export class UpdateMenuDto {
  @IsString()
  label: string;

  @IsString()
  labelEn: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  type?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  router?: string;

  @IsOptional()
  @IsString()
  rule?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  state?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}

export class ChangeMenuStateDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @Type(() => Number)
  @IsInt()
  state: number;
}
