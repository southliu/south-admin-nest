import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Menu } from '../entities/menu.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto/role.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { buildTree } from '../user/utils/helper';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async page(dto: PaginationDto & { name?: string }) {
    const { page = 1, pageSize = 10, name } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.menus', 'menu')
      .where('role.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('role.name LIKE :name', { name: `%${name}%` });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('role.createdAt', 'DESC')
      .getManyAndCount();

    const itemsWithCounts = items.map((role) => ({
      ...role,
      menuCount: role.menus?.length || 0,
    }));

    return {
      items: itemsWithCounts,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(createRoleDto: CreateRoleDto) {
    const { name, description, authorize } = createRoleDto;

    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new BadRequestException('Role name already exists');
    }

    const role = this.roleRepository.create({ name, description });

    if (authorize && authorize.length > 0) {
      const menus = await this.menuRepository.find({
        where: authorize.map((id) => ({ id })),
      });
      const validMenus = menus.filter((menu) => menu.isDeleted === 0);
      role.menus = validMenus;
    }

    return await this.roleRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['menus'],
    });

    if (!role || role.isDeleted === 1) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'admin') {
      throw new ForbiddenException('Cannot update admin role');
    }

    const { name, description, authorize } = updateRoleDto;

    if (name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name },
      });
      if (existingRole) {
        throw new BadRequestException('Role name already exists');
      }
    }

    role.name = name;
    role.description = description;

    if (authorize !== undefined) {
      if (authorize.length > 0) {
        const menus = await this.menuRepository.find({
          where: authorize.map((id) => ({ id })),
        });
        const validMenus = menus.filter((menu) => menu.isDeleted === 0);
        role.menus = validMenus;
      } else {
        role.menus = [];
      }
    }

    return await this.roleRepository.save(role);
  }

  async detail(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['menus'],
    });

    if (!role || role.isDeleted === 1) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      menus: undefined,
      authorize: role.menus?.map((menu) => menu.id) || [],
    };
  }

  async list() {
    return await this.roleRepository.find({
      where: { isDeleted: 0 },
      select: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    });
  }

  async delete(id: number) {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role || role.isDeleted === 1) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'admin') {
      throw new ForbiddenException('Cannot delete admin role');
    }

    role.isDeleted = 1;
    role.deletedAt = new Date();
    await this.roleRepository.save(role);
  }

  async getAuthorize(roleId: number) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus', 'menus.parent'],
    });

    if (!role || role.isDeleted === 1) {
      throw new NotFoundException('Role not found');
    }

    const menuIds = role.menus?.map((menu) => menu.id) || [];
    const treeData = buildTree(role.menus, null);

    return {
      defaultCheckedKeys: menuIds,
      treeData: treeData,
    };
  }

  async saveAuthorize(roleId: number, menuIds: number[]) {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['menus'],
    });

    if (!role || role.isDeleted === 1) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'admin') {
      throw new ForbiddenException('Cannot modify admin role authorization');
    }

    const menus = await this.menuRepository.find({
      where: menuIds.map((id) => ({ id })),
    });
    const validMenus = menus.filter((menu) => menu.isDeleted === 0);
    role.menus = validMenus;

    await this.roleRepository.save(role);
  }
}
