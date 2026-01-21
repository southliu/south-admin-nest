import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginationDto } from '../dto/user.dto';

@Controller('system/permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('page')
  async page(@Query() dto: PaginationDto & { name?: string }) {
    return await this.permissionService.page(dto);
  }

  @Post('create')
  async create(@Body() body: { name: string; description?: string }) {
    return await this.permissionService.create(body.name, body.description);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.permissionService.detail(id);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: number,
    @Body() body: { name: string; description?: string },
  ) {
    return await this.permissionService.update(id, body.name, body.description);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.permissionService.delete(id);
    return { message: 'Permission deleted successfully' };
  }

  @Get('list')
  async list() {
    return await this.permissionService.list();
  }
}
