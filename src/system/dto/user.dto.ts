import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  roleIds?: number[];
}

export class UpdateUserDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  roleIds?: number[];
}

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  confirmPassword: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number = 10;
}

/** 用户分页查询（不能用交叉类型，否则 ValidationPipe 反射元数据退化为 Object，@Type 转换失效） */
export class UserPageDto extends PaginationDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
