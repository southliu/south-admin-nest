import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { PaginationDto } from '../dto/user.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async page(dto: PaginationDto & { name?: string }) {
    const { page = 1, pageSize = 10, name } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('permission.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('permission.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(name: string, description?: string) {
    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });
    if (existingPermission) {
      return existingPermission;
    }

    const permission = this.permissionRepository.create({ name, description });
    return await this.permissionRepository.save(permission);
  }

  async detail(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission || permission.isDeleted === 1) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(id: number, name: string, description?: string) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission || permission.isDeleted === 1) {
      throw new NotFoundException('Permission not found');
    }

    permission.name = name;
    permission.description = description;
    return await this.permissionRepository.save(permission);
  }

  async delete(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission || permission.isDeleted === 1) {
      throw new NotFoundException('Permission not found');
    }

    permission.isDeleted = 1;
    permission.deletedAt = new Date();
    await this.permissionRepository.save(permission);
  }

  async list() {
    return await this.permissionRepository.find({
      where: { isDeleted: 0 },
      select: ['id', 'name', 'description'],
    });
  }
}
