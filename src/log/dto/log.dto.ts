import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryLogDto extends PaginationDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  type?: number; // 0=error, 1=success
}

export class CreateLogDto {
  @IsString()
  username: string;

  @IsString()
  ip: string;

  @IsString()
  method: string;

  @IsString()
  url: string;

  @IsString()
  params: string;

  @IsString()
  userAgent: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsNumber()
  latency?: number;

  @IsOptional()
  @IsNumber()
  type?: number; // 0=error, 1=success
}
