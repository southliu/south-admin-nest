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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MenuService } from './menu.service';
import {
  CreateMenuDto,
  UpdateMenuDto,
  ChangeMenuStateDto,
} from '../dto/menu.dto';

@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('list')
  async list(@CurrentUser() user?: any) {
    return await this.menuService.list(user);
  }

  @Get('page')
  async page(@Query() dto: any) {
    return await this.menuService.page(dto);
  }

  @Post('create')
  async create(@Body() createMenuDto: CreateMenuDto) {
    return await this.menuService.create(createMenuDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.menuService.delete(id);
    return { message: '删除成功' };
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() updateMenuDto: UpdateMenuDto) {
    return await this.menuService.update(id, updateMenuDto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.menuService.detail(id);
  }

  @Put('changeState')
  async changeState(@Body() changeStateDto: ChangeMenuStateDto) {
    await this.menuService.changeState(changeStateDto);
    return { message: 'Menu state changed successfully' };
  }
}
