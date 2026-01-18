import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [UserModule, RoleModule, PermissionModule, MenuModule],
  exports: [UserModule, RoleModule, PermissionModule, MenuModule],
})
export class SystemModule {}
