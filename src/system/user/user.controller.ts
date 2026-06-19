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
import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  UserInfo,
} from '../../common/decorators/current-user.decorator';
import { UserService } from './user.service';
import {
  LoginDto,
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  PaginationDto,
} from '../dto/user.dto';

@Controller('system/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }

  @Get('refreshPermissions')
  async refreshPermissions(@CurrentUser() user: UserInfo) {
    return await this.userService.refreshPermissions(user.id);
  }

  @Get('page')
  async page(@Query() dto: PaginationDto & { username?: string }) {
    return await this.userService.page(dto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.userService.detail(id);
  }

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete('/:id')
  async delete(@Param('id') id: number) {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Get('list')
  async list() {
    return await this.userService.list();
  }

  @Post('updatePassword')
  async updatePassword(
    @CurrentUser() user: UserInfo,
    @Body() dto: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(user.id, dto);
    return { message: 'Password updated successfully' };
  }
}
