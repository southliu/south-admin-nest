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
  status?: string;

  @IsOptional()
  @IsNumber()
  type?: number; // 0=error, 1=success
}

export class CreateLogDto {
  username: string;
  ip: string;
  method: string;
  url: string;
  params: string;
  userAgent: string;
  status: string;
  error?: string;
  latency?: number;
  type?: number; // 0=error, 1=success
}
