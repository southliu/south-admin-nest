import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import {
  LoginDto,
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  PaginationDto,
} from '../dto/user.dto';
import { UserInfo } from '../../common/decorators/current-user.decorator';
import { Menu } from '../entities/menu.entity';
import { buildTree } from './utils/helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'permissions'],
    });

    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new ForbiddenException('User is disabled');
    }

    if (user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    const payload: UserInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.roles?.map((item) => item.id),
    };

    const token = await this.jwtService.signAsync(payload);

    const permissions = this.getUserPermissions(user);

    return {
      user: payload,
      token,
      permissions,
    };
  }

  async refreshPermissions(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions', 'permissions'],
    });

    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    const permissions = this.getUserPermissions(user);
    const roles = user.roles || [];

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.roles?.map((role) => role.id),
      },
      permissions,
      roles,
    };
  }

  async page(dto: PaginationDto & { username?: string }) {
    const { page = 1, pageSize = 10, username } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.isDeleted = :isDeleted', { isDeleted: 0 });

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const itemsWithRoleCount = items.map((user) => ({
      ...user,
      rolesName: (user.roles?.map((role) => role.name) || []).join(','),
      roleCount: user.roles?.length || 0,
    }));

    return {
      items: itemsWithRoleCount,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async detail(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    return {
      ...user,
      roleIds: user.roles?.map((role) => role.id) || [],
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { username, password, roleIds, ...rest } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      ...rest,
    });

    if (roleIds && roleIds.length > 0) {
      // 获取角色及其关联的权限
      const roles = await this.roleRepository.find({
        where: roleIds.map((id) => ({ id })),
        relations: ['permissions'],
      });
      user.roles = roles;

      // 提取所有权限并关联到用户
      const permissions = roles.flatMap((role) => role.permissions || []);
      const uniquePermissions = Array.from(
        new Map(permissions.map((p) => [p.id, p])).values(),
      );
      user.permissions = uniquePermissions;
    }

    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    const { username, password, roleIds, ...rest } = updateUserDto;

    if (username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUser) {
        throw new BadRequestException('用户名已存在');
      }
    }

    user.username = username;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    Object.assign(user, rest);

    if (roleIds) {
      if (roleIds.length > 0) {
        // 获取角色及其关联的权限
        const roles = await this.roleRepository.find({
          where: roleIds.map((id) => ({ id })),
          relations: ['permissions'],
        });
        user.roles = roles;

        // 提取所有权限并关联到用户
        const permissions = roles.flatMap((role) => role.permissions || []);
        const uniquePermissions = Array.from(
          new Map(permissions.map((p) => [p.id, p])).values(),
        );
        user.permissions = uniquePermissions;
      } else {
        user.roles = [];
        user.permissions = [];
      }
    }

    return await this.userRepository.save(user);
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    user.isDeleted = 1;
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async list() {
    return await this.userRepository.find({
      where: { isDeleted: 0, status: 1 },
      select: ['id', 'username', 'name', 'email', 'phone'],
    });
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = dto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('新旧密码不一致');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('旧密码错误');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }

  async getAuthorize(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.menus'],
    });

    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    const menuTree = await this.getMenuTree();
    const menuIds = new Set<number>();

    user.roles?.forEach((role) => {
      role.menus?.forEach((menu) => {
        if (menu.isDeleted === 0) {
          menuIds.add(menu.id);
        }
      });
    });

    // 轮询菜单树，如果子菜单有数据，则将父级菜单加入结果中

    return {
      defaultCheckedKeys: Array.from(menuIds),
      treeData: menuTree,
    };
  }

  // 获取权限菜单
  async getMenuTree() {
    const menus = await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .leftJoinAndSelect('menu.permission', 'permission')
      .where('menu.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('menu.state = :state', { state: 1 })
      .orderBy('menu.order', 'ASC')
      .getMany();

    return buildTree(menus, null);
  }

  async saveAuthorize(userId: number, menuIds: number[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('用户不存在');
    }

    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.menus', 'menu')
      .where('role.id IN (:...roleIds)', {
        roleIds: user.roles?.map((r) => r.id) || [],
      })
      .getMany();

    roles.forEach((role) => {
      role.menus =
        role.menus?.filter((menu) => menuIds.includes(menu.id)) || [];
    });

    await this.roleRepository.save(roles);
  }

  private getUserPermissions(user: User): string[] {
    const permissions = new Set<string>();

    user.permissions?.forEach((p) => {
      permissions.add(p.name);
    });

    user.roles?.forEach((role) => {
      role.permissions?.forEach((p) => {
        permissions.add(p.name);
      });
    });

    return Array.from(permissions);
  }
}
