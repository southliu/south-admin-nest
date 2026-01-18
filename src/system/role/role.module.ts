import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Menu } from '../entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, Menu])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
