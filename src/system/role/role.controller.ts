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
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('page')
  async page(@Query() dto: PaginationDto & { name?: string }) {
    return await this.roleService.page(dto);
  }

  @Post('create')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.roleService.update(id, updateRoleDto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.roleService.detail(id);
  }

  @Get('list')
  async list() {
    return await this.roleService.list();
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.roleService.delete(id);
    return { message: 'Role deleted successfully' };
  }

  @Get('authorize')
  async getAuthorize(@Query('roleId') roleId: number) {
    return await this.roleService.getAuthorize(roleId);
  }

  @Put('authorize/save')
  async saveAuthorize(@Body() body: { roleId: number; menuIds: number[] }) {
    await this.roleService.saveAuthorize(body.roleId, body.menuIds);
    return { message: 'Authorization saved successfully' };
  }
}
