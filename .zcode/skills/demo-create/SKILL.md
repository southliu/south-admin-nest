---
name: demo-create
description: 生成或修改增删改查(CRUD)模块时必须使用本skill。当用户要求新增业务模块、生成增删改查接口、创建xxx管理功能、或修改现有CRUD代码时，按本skill规定的文件结构、命名和接口契约生成，保证与项目现有格式一致。适用范围：新建 Controller/Service/Entity/DTO/Module、批量删除、状态切换、分页过滤等。
---

# demo-create：nest 项目 CRUD 模块生成规范

为 `south-admin-nest`（NestJS + TypeORM + MySQL）生成增删改查模块时，**必须**按本文件的结构和契约执行。以模块名 `{{name}}`（表 `{{name}}`，路由前缀 `system/{{name}}`）为例。

## 一、要创建/修改的文件

| 文件 | 作用 |
|---|---|
| `src/system/entities/{{name}}.entity.ts` | TypeORM 实体（继承 BaseEntity） |
| `src/system/dto/{{name}}.dto.ts` | 请求 DTO（class-validator） |
| `src/system/{{name}}/{{name}}.service.ts` | 业务逻辑 |
| `src/system/{{name}}/{{name}}.controller.ts` | 控制器（`@Controller('system/{{name}}')`） |
| `src/system/system.module.ts` + `init.sql` | 注册 providers/controllers + 种子数据 |

（独立大模块可参照 `src/log/` 自建目录并加 `*.module.ts`，在 `app.module.ts` 注册。）

## 二、接口契约（与 react-admin 前端对齐，违反即为 bug）

1. **响应结构**：Controller 直接返回业务数据，全局 `response.interceptor.ts` 自动包装为 `{code:200, message, data}`；抛 `NotFoundException/BadRequestException` 由异常过滤器转统一格式。
2. **分页参数是 `pageSize`**：Query DTO 必须给数字字段加转换，且**禁止用交叉类型**（`PaginationDto & {...}` 的反射元数据会退化为 Object，`@Type` 全部失效，返回字符串数字——这是修过的 bug）：
   ```typescript
   export class {{Name}}PageDto extends PaginationDto {
     @IsOptional() @IsString() name?: string;
     // ...其余过滤字段
   }
   // controller: @Get('page') async page(@Query() dto: {{Name}}PageDto)
   ```
   `PaginationDto`（`src/common/dto/` 或 `src/system/dto/user.dto.ts`）已含 `page/pageSize` 的 `@Type(() => Number) + @IsInt()`。
3. **分页返回**：`{items, page, pageSize, total, totalPages}`（数字类型）。
4. **JSON 键驼峰**：实体属性名即驼峰（`createdAt/parentId/roleIds`）。
5. **零值合法**：`state=0/status=0` 有效。范围校验用 `@IsIn([0, 1])`，**禁止**用 `@Min(1)` 或必填把 0 拦掉。
6. **更新支持置零/清空**：Update DTO 字段全部 `@IsOptional()`，service 直接赋值。
7. **接口面**：
   `@Get('page')`、`@Get('detail')`、`@Post('create')`、`@Put('update/:id')`、`@Delete('/:id')`、`@Post('batchDelete')`（**具名路由放在 `/:id` 之前更稳妥**）、（有状态时）`@Put('changeState')`、`@Get('list')`。
8. **过滤参数**：QueryBuilder `andWhere('x.name LIKE :name', {name: '%'+v+'%'})`；count 用 `getManyAndCount()` 天然跟随过滤。
9. **不泄露密码**：用户类实体加 `toJSON() { const { password, ...rest } = this; return rest; }`（响应拦截器已支持 toJSON）。
10. **软删除**：`isDeleted=1, deletedAt=new Date()`；批量删除空 ids 抛 `BadRequestException('请选择要删除的xx')`。

## 三、文件模板

### 1. `src/system/entities/{{name}}.entity.ts`

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('{{name}}')
export class {{Name}} extends BaseEntity {
  // TODO: 业务字段；BaseEntity 已含 id/createdAt/updatedAt/isDeleted/deletedAt
  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1, comment: '状态 1=启用 0=禁用' })
  status: number;
}
```

表结构由 `app.module.ts` 的 `synchronize: true` 自动建，不要手写建表 SQL。

### 2. `src/system/dto/{{name}}.dto.ts`

```typescript
import { IsString, IsOptional, IsInt, IsIn, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from './user.dto';

export class Create{{Name}}Dto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
}

export class Update{{Name}}Dto {
  @IsOptional() @IsString() name?: string;   // 全部可选，支持置零/清空
  @IsOptional() @IsString() description?: string;
}

export class {{Name}}PageDto extends PaginationDto {
  @IsOptional() @IsString() name?: string;
}

export class Change{{Name}}StateDto {
  @Type(() => Number) @IsInt() id: number;
  @Type(() => Number) @IsInt() @IsIn([0, 1]) state: number;
}
```

### 3. `src/system/{{name}}/{{name}}.service.ts`

参照 `src/system/user/user.service.ts`：构造器注入 `@InjectRepository({{Name}})`；分页用 QueryBuilder + `getManyAndCount()`；写操作前查存在性（不存在抛 `NotFoundException('xx不存在')`）。

### 4. `src/system/{{name}}/{{name}}.controller.ts`

```typescript
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { {{Name}}Service } from './{{name}}.service';
// ... DTO imports

@Controller('system/{{name}}')
export class {{Name}}Controller {
  constructor(private readonly service: {{Name}}Service) {}

  @Get('page')
  async page(@Query() dto: {{Name}}PageDto) { return this.service.page(dto); }

  @Get('detail')
  async detail(@Query('id') id: number) { return this.service.detail(id); }

  @Post('create')
  async create(@Body() dto: Create{{Name}}Dto) { return this.service.create(dto); }

  @Post('batchDelete')
  async deleteBatch(@Body('ids') ids: number[]) { return this.service.deleteBatch(ids); }

  @Put('changeState')
  async changeState(@Body() dto: Change{{Name}}StateDto) { return this.service.changeState(dto); }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() dto: Update{{Name}}Dto) { return this.service.update(id, dto); }

  @Delete('/:id')
  async delete(@Param('id') id: number) { return this.service.delete(id); }

  @Get('list')
  async list() { return this.service.list(); }
}
```

### 5. 注册与种子数据

- `src/system/system.module.ts`：`imports: [TypeOrmModule.forFeature([{{Name}}])]`，providers/controllers 数组加入对应类
- `init.sql`（项目根，表名**无 `sys_` 前缀**：`{{name}}`/`role_menu`/`user_role`/`permission`/`menu`）：参照第 16 节"日志管理模块数据"追加权限、菜单（注意：INSERT 列数必须与 SELECT 值数一致，按钮菜单别漏 router 列的 NULL）、role_menu 授权

## 四、完成前自查

- [ ] `pnpm build`（或 start:dev 无编译错误）
- [ ] curl 验证：`?pageSize=20` 返回**数字**、过滤生效、增删改/批量删/changeState(0/1) 正常
- [ ] Query DTO 无交叉类型；响应无密码字段
