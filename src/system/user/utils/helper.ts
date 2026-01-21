import { AuthorizeMenuTree } from '../../vo/menu.vo';
import { Menu } from '../../entities/menu.entity';

// 处理授权菜单
export const buildTree = (
  menus: Menu[],
  parentId: number | null,
): AuthorizeMenuTree[] => {
  const tree: AuthorizeMenuTree[] = [];

  for (let i = 0; i < menus?.length; i++) {
    const menu = menus[i];
    const parentMenuId = menu.parent ? menu.parent.id : null;
    const result: AuthorizeMenuTree = {
      icon: menu.icon,
      key: menu.id.toString(),
      title: menu.label,
      type: menu.type,
      value: menu.id.toString(),
    };

    if (parentMenuId === parentId) {
      const children = buildTree(menus, menu.id);
      if (children.length > 0) {
        result.children = children;
      }
      tree.push(result);
    }
  }
  return tree;
};
