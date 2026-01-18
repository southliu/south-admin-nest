import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get('list')
  async list() {
    return {
      userCount: 0,
      roleCount: 0,
      permissionCount: 0,
      menuCount: 0,
      articleCount: 0,
    };
  }
}
