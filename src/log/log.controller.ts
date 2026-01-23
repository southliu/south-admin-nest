import { Controller, Get, Delete, Body, Query, Param } from '@nestjs/common';
import { LogService } from './log.service';
import { QueryLogDto } from './dto/log.dto';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('page')
  async page(@Query() dto: QueryLogDto) {
    return await this.logService.page(dto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.logService.detail(id);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return await this.logService.delete(id);
  }

  @Delete('batch')
  async deleteBatch(@Body('ids') ids: number[]) {
    return await this.logService.deleteBatch(ids);
  }
}
