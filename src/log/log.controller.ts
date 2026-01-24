import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { LogService } from './log.service';
import { QueryLogDto, CreateLogDto } from './dto/log.dto';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('page')
  async page(@Query() dto: QueryLogDto) {
    return await this.logService.page(dto);
  }

  @Post('create')
  async create(@Body() createLogDto: CreateLogDto) {
    return await this.logService.create(createLogDto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.logService.detail(id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return await this.logService.delete(id);
  }

  @Post('batchDelete')
  async deleteBatch(@Body('ids') ids: number[]) {
    return await this.logService.deleteBatch(ids);
  }
}
