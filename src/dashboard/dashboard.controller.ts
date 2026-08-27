import { Controller, Get } from '@nestjs/common';

@Controller()
export class DashboardController {
  /** 仪表盘数据总览（演示数据，前端仅依赖接口成功返回） */
  @Get('dashboard')
  async trends() {
    return {
      payDate: '2022-10-19 ~ 2022-10-29',
      user: 9424,
      recharge: 2590,
      order: 3478,
      game: 350,
    };
  }

  @Get('dashboard/list')
  async list() {
    return {
      userCount: 0,
      roleCount: 0,
      permissionCount: 0,
      menuCount: 0,
      articleCount: 0,
    };
  }

  /** 合作公司下拉数据（演示数据） */
  @Get('platform/partner')
  async partnerList() {
    return [
      { id: '1', name: '演示公司A' },
      { id: '2', name: '演示公司B' },
      { id: '3', name: '演示公司C' },
    ];
  }

  /** 游戏下拉数据（演示数据） */
  @Get('authority/common/games')
  async gameList() {
    return [
      { id: '1', name: '演示游戏A' },
      { id: '2', name: '演示游戏B' },
      { id: '3', name: '演示游戏C' },
    ];
  }
}
