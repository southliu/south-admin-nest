import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Menu } from '../entities/menu.entity';
import { Permission } from '../entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Permission])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
