import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  authorize?: number[];
}

export class UpdateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  authorize?: number[];
}

export class AuthorizeRoleDto {
  @Type(() => Number)
  @IsInt()
  roleId: number;

  @IsArray()
  @Type(() => Number)
  menuIds: number[];
}
