import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, TreeRepository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { Permission } from '../entities/permission.entity';
import { CreateMenuDto, UpdateMenuDto, ChangeMenuStateDto } from '../dto/menu.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async list(user?: any) {
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .where('menu.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('menu.state = :state', { state: 1 })
      .orderBy('menu.order', 'ASC');

    const menus = await queryBuilder.getMany();

    return this.buildTree(menus, null);
  }

  async page(dto: PaginationDto & { label?: string; labelEn?: string; state?: number; rule?: string }) {
    const { page = 1, pageSize = 10, label, labelEn, state, rule } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .leftJoinAndSelect('menu.permission', 'permission')
      .where('menu.isDeleted = :isDeleted', { isDeleted: 0 });

    if (label) {
      queryBuilder.andWhere('menu.label LIKE :label', { label: `%${label}%` });
    }

    if (labelEn) {
      queryBuilder.andWhere('menu.labelEn LIKE :labelEn', { labelEn: `%${labelEn}%` });
    }

    if (state !== undefined) {
      queryBuilder.andWhere('menu.state = :state', { state });
    }

    if (rule) {
      queryBuilder.andWhere('menu.rule LIKE :rule', { rule: `%${rule}%` });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('menu.order', 'ASC')
      .getManyAndCount();

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(createMenuDto: CreateMenuDto) {
    const { label, labelEn, type, icon, router, rule, order, state, parentId, actions } = createMenuDto;

    const parent = parentId ? await this.menuRepository.findOne({ where: { id: parentId } }) : null;

    if (parentId && (!parent || parent.isDeleted === 1)) {
      throw new NotFoundException('Parent menu not found');
    }

    const menu = this.menuRepository.create({
      label,
      labelEn,
      type,
      icon,
      router,
      rule,
      order: order || 0,
      state: state !== undefined ? state : 1,
      parent,
    });

    const savedMenu = await this.menuRepository.save(menu);

    if (rule) {
      const existingPermission = await this.permissionRepository.findOne({ where: { name: rule } });
      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: rule,
          description: `Permission for menu: ${label}`,
        });
        menu.permission = await this.permissionRepository.save(permission);
        await this.menuRepository.save(menu);
      }
    }

    if (actions && actions.length > 0) {
      const buttonType = 3;
      for (const action of actions) {
        const buttonMenu = this.menuRepository.create({
          label: action.toString(),
          labelEn: action.toString(),
          type: buttonType,
          router: '',
          order: 0,
          state: 1,
          parent: savedMenu,
        });
        await this.menuRepository.save(buttonMenu);
      }
    }

    return savedMenu;
  }

  async delete(id: number) {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu || menu.isDeleted === 1) {
      throw new NotFoundException('Menu not found');
    }

    const children = await this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.parent = :parentId', { parentId: id })
      .andWhere('menu.isDeleted = :isDeleted', { isDeleted: 0 })
      .getCount();

    if (children > 0) {
      throw new BadRequestException('Cannot delete menu with children');
    }

    menu.isDeleted = 1;
    menu.deletedAt = new Date();
    await this.menuRepository.save(menu);
  }

  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent'],
    });

    if (!menu || menu.isDeleted === 1) {
      throw new NotFoundException('Menu not found');
    }

    const { label, labelEn, icon, router, rule, order, state, parentId } = updateMenuDto;

    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('Menu cannot be its own parent');
      }

      if (parentId !== null) {
        const parent = await this.menuRepository.findOne({ where: { id: parentId } });
        if (!parent || parent.isDeleted === 1) {
          throw new NotFoundException('Parent menu not found');
        }
        menu.parent = parent;
      } else {
        menu.parent = null;
      }
    }

    menu.label = label;
    menu.labelEn = labelEn;
    menu.icon = icon;
    menu.router = router;
    menu.rule = rule;
    menu.order = order !== undefined ? order : menu.order;
    menu.state = state !== undefined ? state : menu.state;

    if (rule) {
      const existingPermission = await this.permissionRepository.findOne({ where: { name: rule } });
      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: rule,
          description: `Permission for menu: ${label}`,
        });
        menu.permission = await this.permissionRepository.save(permission);
      }
    }

    return await this.menuRepository.save(menu);
  }

  async detail(id: number) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'permission'],
    });

    if (!menu || menu.isDeleted === 1) {
      throw new NotFoundException('Menu not found');
    }

    return menu;
  }

  async changeState(changeStateDto: ChangeMenuStateDto) {
    const { id, state } = changeStateDto;

    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu || menu.isDeleted === 1) {
      throw new NotFoundException('Menu not found');
    }

    menu.state = state;
    await this.menuRepository.save(menu);
  }

  private buildTree(menus: Menu[], parentId: number | null): Menu[] {
    const tree: Menu[] = [];

    for (const menu of menus) {
      const parentMenuId = menu.parent ? menu.parent.id : null;

      if (parentMenuId === parentId) {
        const children = this.buildTree(menus, menu.id);
        if (children.length > 0) {
          menu.children = children;
        } else {
          delete menu.children;
        }
        tree.push(menu);
      }
    }

    return tree;
  }
}
