import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { Permission } from '../entities/permission.entity';
import {
  CreateMenuDto,
  UpdateMenuDto,
  ChangeMenuStateDto,
} from '../dto/menu.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async list(user?: any) {
    if (!user || !user.id) {
      throw new BadRequestException('User information is required');
    }

    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.menus', 'roleMenus')
      .where('user.id = :id', { id: user.id })
      .getOne();
    if (!userInfo) {
      throw new NotFoundException('用户无权限！');
    }

    const roleIds = userInfo.roles.map((role) => role.id);

    let roleMenuAssociations = [];

    if (roleIds.length > 0) {
      // 获取当前角色下面所有的菜单数据
      roleMenuAssociations = await this.roleRepository
        .createQueryBuilder('role')
        .leftJoin('role.menus', 'menu')
        .select(['role.id', 'menu.id'])
        .where('role.id IN (:...roleIds)', { roleIds })
        .getMany();

      // 从关联数据中提取所有菜单ID
      const associatedMenuIds = roleMenuAssociations
        .flatMap(
          (association) => association.menus?.map((menu) => menu.id) || [],
        )
        .filter((id, index, self) => self.indexOf(id) === index); // 去重

      const menuQuery = this.menuRepository
        .createQueryBuilder('menu')
        .leftJoinAndSelect('menu.parent', 'parent')
        .leftJoinAndSelect('menu.permission', 'permission')
        .where('menu.isDeleted = :isDeleted', { isDeleted: 0 })
        .andWhere('menu.state = :state', { state: 1 })
        .andWhere('menu.type != :type', { type: 3 })
        .orderBy('menu.order', 'ASC');

      const allMenus = await menuQuery.getMany();

      // 获取所有父级菜单ID
      const allParentIds = allMenus
        .filter((menu) => menu.parent)
        .map((menu) => menu.parent.id);

      // 确保要显示的菜单ID列表：包含关联的菜单ID + 它们的父级菜单ID
      const menuIdsToShow = [
        ...new Set([...associatedMenuIds, ...allParentIds]),
      ];

      // 过滤出需要显示的菜单
      const filteredMenus = allMenus.filter((menu) =>
        menuIdsToShow.includes(menu.id),
      );

      const uniqueMenus = Array.from(
        new Map(filteredMenus.map((menu) => [menu.id, menu])).values(),
      );

      const transformedMenus = uniqueMenus.map((menu) => {
        const menuObj = { ...menu };
        if (menuObj.permission) {
          menuObj.rule = menuObj.permission.name;
          delete menuObj.permission;
        }
        menuObj.key = menuObj.router || menuObj.id.toString();
        return menuObj;
      });

      return this.buildTree(transformedMenus, null);
    } else {
      return [];
    }
  }

  async page(
    dto: PaginationDto & {
      label?: string;
      labelEn?: string;
      state?: number;
      rule?: string;
    },
  ) {
    const { label, labelEn, state, rule } = dto;

    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.parent', 'parent')
      .leftJoinAndSelect('menu.permission', 'permission')
      .where('menu.isDeleted = :isDeleted', { isDeleted: 0 });

    if (label) {
      queryBuilder.andWhere('menu.label LIKE :label', { label: `%${label}%` });
    }

    if (labelEn) {
      queryBuilder.andWhere('menu.labelEn LIKE :labelEn', {
        labelEn: `%${labelEn}%`,
      });
    }

    if (state !== undefined) {
      queryBuilder.andWhere('menu.state = :state', { state });
    }

    if (rule) {
      queryBuilder.andWhere('permission.name LIKE :rule', {
        rule: `%${rule}%`,
      });
    }

    const items = await queryBuilder.orderBy('menu.order', 'ASC').getMany();

    const transformedMenus = items.map((menu) => {
      const menuObj: any = { ...menu };
      if (menuObj.permission) {
        menuObj.rule = menuObj.permission.name;
        delete menuObj.permission;
      }
      return menuObj;
    });

    const tree = this.buildTree(transformedMenus, null);

    return {
      items: tree,
      total: await this.countTreeNodes(),
    };
  }

  private countTreeNodes() {
    const menuBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.isDeleted = :isDeleted', { isDeleted: 0 })
      .where(
        '(menu.type = :type1 AND menu.parent_id IS NULL) OR (menu.type = :type2 AND menu.parent_id IS NULL)',
        {
          type1: 1,
          type2: 2,
        },
      );
    return menuBuilder.getCount();
  }

  async create(createMenuDto: CreateMenuDto, user?: any) {
    const {
      label,
      labelEn,
      type,
      icon,
      router,
      rule,
      order,
      state,
      parentId,
      actions,
    } = createMenuDto;

    const parent = parentId
      ? await this.menuRepository.findOne({ where: { id: parentId } })
      : null;

    if (parentId && (!parent || parent.isDeleted === 1)) {
      throw new NotFoundException('父级菜单不存在');
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

    // 获取当前用户的角色
    let userRoles: Role[] = [];
    if (user && user.id) {
      const userInfo = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .where('user.id = :id', { id: user.id })
        .getOne();

      if (userInfo && userInfo.roles && userInfo.roles.length > 0) {
        userRoles = userInfo.roles;
      }
    }

    // 处理权限并关联到角色
    let menuPermission: Permission | null = null;
    if (rule) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: rule },
      });
      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: rule,
          description: label,
        });
        menuPermission = await this.permissionRepository.save(permission);
        savedMenu.permission = menuPermission;
        await this.menuRepository.save(savedMenu);
      } else {
        menuPermission = existingPermission;
      }
    }

    // 将菜单关联到用户的所有角色（累加，不去重）
    if (userRoles.length > 0) {
      for (const role of userRoles) {
        await this.roleRepository
          .createQueryBuilder()
          .insert()
          .into('role_menu')
          .values({
            role_id: role.id,
            menu_id: savedMenu.id,
          })
          .orIgnore()
          .execute();
      }
    }

    // 处理按钮菜单
    if (actions && actions.length > 0) {
      const buttonType = 3;
      for (const action of actions) {
        let actionLabel = '';
        let actionLabelEn = '';
        switch (action) {
          case 'create':
            actionLabel = '新增';
            actionLabelEn = 'Create';
            break;
          case 'update':
            actionLabel = '修改';
            actionLabelEn = 'Update';
            break;
          case 'delete':
            actionLabel = '删除';
            actionLabelEn = 'Delete';
            break;
          case 'detail':
            actionLabel = '详情';
            actionLabelEn = 'Detail';
            break;
          case 'export':
            actionLabel = '导出权限';
            actionLabelEn = 'Export';
            break;
          case 'status':
            actionLabel = '状态权限';
            actionLabelEn = 'Status';
            break;
        }

        const buttonMenu = this.menuRepository.create({
          label: actionLabel,
          labelEn: actionLabelEn,
          type: buttonType,
          rule: `${rule}/${action}`,
          router: '',
          order: 0,
          state: 1,
          parent: savedMenu,
        });
        const savedButtonMenu = await this.menuRepository.save(buttonMenu);

        // 为按钮菜单创建权限并关联到角色
        const buttonPermissionName = `${rule}/${action}`;
        const existingButtonPermission =
          await this.permissionRepository.findOne({
            where: { name: buttonPermissionName },
          });

        let buttonPermission: Permission | null = null;
        if (!existingButtonPermission) {
          buttonPermission = this.permissionRepository.create({
            name: buttonPermissionName,
            description: actionLabel,
          });
          buttonPermission =
            await this.permissionRepository.save(buttonPermission);
        } else {
          buttonPermission = existingButtonPermission;
        }

        // 将按钮菜单关联到用户的所有角色（累加，不去重）
        if (userRoles.length > 0) {
          for (const role of userRoles) {
            await this.roleRepository
              .createQueryBuilder()
              .insert()
              .into('role_menu')
              .values({
                role_id: role.id,
                menu_id: savedButtonMenu.id,
              })
              .orIgnore()
              .execute();
          }
        }
      }
    }

    return savedMenu;
  }

  async delete(id: number) {
    const menu = await this.menuRepository.findOne({
      where: { id },
    });

    if (!menu || menu.isDeleted === 1) {
      throw new NotFoundException('菜单不存在');
    }

    const children = await this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.parent = :parentId', { parentId: id })
      .andWhere('menu.isDeleted = :isDeleted', { isDeleted: 0 })
      .getCount();

    if (children > 0) {
      throw new BadRequestException('不能删除有子菜单的菜单');
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
      throw new NotFoundException('菜单不存在');
    }

    const { label, labelEn, type, icon, router, rule, order, state, parentId } =
      updateMenuDto;

    if (parentId !== undefined) {
      if (parentId === id) {
        throw new BadRequestException('菜单不能是它自己的父菜单');
      }

      if (parentId !== null) {
        const parent = await this.menuRepository.findOne({
          where: { id: parentId },
        });
        if (!parent || parent.isDeleted === 1) {
          throw new NotFoundException('父级菜单不存在');
        }
        menu.parent = parent;
      } else {
        menu.parent = null;
      }
    }

    menu.label = label;
    menu.labelEn = labelEn;
    menu.type = type !== undefined ? type : menu.type;
    menu.icon = icon;
    menu.router = router;
    menu.rule = rule;
    menu.order = order !== undefined ? order : menu.order;
    menu.state = state !== undefined ? state : menu.state;

    if (rule) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: rule },
      });
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
      throw new NotFoundException('菜单不存在');
    }

    return menu;
  }

  async changeState(changeStateDto: ChangeMenuStateDto) {
    const { id, state } = changeStateDto;

    const menu = await this.menuRepository.findOne({ where: { id } });

    if (!menu || menu.isDeleted === 1) {
      throw new NotFoundException('菜单不存在');
    }

    menu.state = state;
    await this.menuRepository.save(menu);
  }

  private buildTree(menus: Menu[], parentId: number | null): Menu[] {
    const tree: Menu[] = [];

    for (let i = 0; i < menus?.length; i++) {
      const menu = menus[i];
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
