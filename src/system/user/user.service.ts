import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { LoginDto, CreateUserDto, UpdateUserDto, UpdatePasswordDto, PaginationDto } from '../dto/user.dto';
import { UserInfo } from '../../common/decorators/current-user.decorator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['roles', 'permissions'],
    });

    if (!user) {
      throw new BadRequestException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid username or password');
    }

    if (user.status !== 1) {
      throw new ForbiddenException('User is disabled');
    }

    if (user.isDeleted === 1) {
      throw new NotFoundException('User not found');
    }

    const payload: UserInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    };

    const token = await this.jwtService.signAsync(payload);

    const permissions = this.getUserPermissions(user);

    return {
      user: payload,
      token,
      permissions,
    };
  }

  async refreshPermissions(userId: number, refreshCache: boolean = false) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions', 'permissions'],
    });

    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('User not found');
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
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${username}%` });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const itemsWithRoleCount = items.map((user) => ({
      ...user,
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
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      roleIds: user.roles?.map((role) => role.id) || [],
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { username, password, roleIds, ...rest } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      ...rest,
    });

    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      user.roles = roles;
    }

    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('User not found');
    }

    const { username, password, roleIds, ...rest } = updateUserDto;

    if (username !== user.username) {
      const existingUser = await this.userRepository.findOne({ where: { username } });
      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }
    }

    user.username = username;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    Object.assign(user, rest);

    if (roleIds) {
      const roles = await this.roleRepository.findByIds(roleIds);
      user.roles = roles;
    }

    return await this.userRepository.save(user);
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('User not found');
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
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
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
      throw new NotFoundException('User not found');
    }

    const menuIds = new Set<number>();
    user.roles?.forEach((role) => {
      role.menus?.forEach((menu) => {
        if (menu.isDeleted === 0) {
          menuIds.add(menu.id);
        }
      });
    });

    return {
      defaultCheckedKeys: Array.from(menuIds),
      treeData: [],
    };
  }

  async saveAuthorize(userId: number, menuIds: number[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user || user.isDeleted === 1) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.menus', 'menu')
      .where('role.id IN (:...roleIds)', { roleIds: user.roles?.map((r) => r.id) || [] })
      .getMany();

    roles.forEach((role) => {
      role.menus = role.menus?.filter((menu) => menuIds.includes(menu.id)) || [];
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
