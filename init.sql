-- ============================================
-- South Admin 初始化数据脚本
-- ============================================

-- 禁用外键约束检查（避免导入时的约束问题）
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 清理现有数据
-- ============================================
DELETE FROM role_menu;
DELETE FROM user_role;
DELETE FROM menu;
DELETE FROM permission;
DELETE FROM role;
DELETE FROM user;

-- ============================================
-- 2. 插入用户表数据
-- ============================================
INSERT INTO `user` (username, password, name, email, status, is_deleted, created_at, updated_at)
VALUES
    ('admin', '$2b$10$07h7npcIysHutrLYCY3yWOhEqtGTCR88pDp66ZztkAdG7RJT/4ZDO', '系统管理员', 'admin@example.com', 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
    ('user1', '$2b$10$07h7npcIysHutrLYCY3yWOhEqtGTCR88pDp66ZztkAdG7RJT/4ZDO', '普通用户', 'user1@example.com', 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ============================================
-- 3. 插入角色表数据
-- ============================================
INSERT INTO `role` (name, description, created_at, updated_at, is_deleted)
VALUES
    ('系统管理员', '最高权限', '2025-01-01 00:00:00', '2025-01-01 00:00:00', 0),
    ('普通用户', '普通用户权限', '2025-01-01 00:00:00', '2025-01-01 00:00:00', 0);

-- ============================================
-- 4. 插入权限表数据
-- ============================================
INSERT INTO `permission` (name, description, created_at, updated_at) VALUES
('/dashboard', '查看仪表盘', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo', '查看示例菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/copy', '复制菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/editor', '编辑示例菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/wangEditor', 'WangEditor 示例', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/virtualScroll', '虚拟滚动示例', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/watermark', '水印示例', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user', '用户管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/index', '用户列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/create', '创建用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/update', '修改用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/view', '查看用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/delete', '删除用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/authority', '用户权限配置', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role', '角色管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/index', '角色列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/create', '创建角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/update', '修改角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/view', '查看角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/delete', '删除角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu', '菜单管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/index', '菜单列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/create', '创建菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/update', '修改菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/view', '查看菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/delete', '删除菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article', '文章管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/index', '文章列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/create', '创建文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/update', '修改文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/view', '查看文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/delete', '删除文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/link', '外部链接', '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ============================================
-- 5. 插入顶级菜单项
-- ============================================
INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '仪表盘', 'Dashboard', 2, 'la:tachometer-alt', '/dashboard', 0, 1, NOW(), NOW(), NULL, 0, id FROM (SELECT id FROM permission WHERE name = '/dashboard') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
VALUES ('组件', 'Components', 1, 'fluent:box-20-regular', '/demo', 1, 1, NOW(), NOW(), NULL, 0, NULL);

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
VALUES ('系统管理', 'System Management', 1, 'ion:settings-outline', '/system', 2, 1, NOW(), NOW(), NULL, 0, NULL);

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
VALUES ('内容管理', 'Content Management', 1, 'majesticons:article-search-line', '/content', 3, 1, NOW(), NOW(), NULL, 0, NULL);

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '外部链接', 'External Link', 2, 'material-symbols:link', 'https://ant-design.antgroup.com', 4, 1, NOW(), NOW(), NULL, 0, id FROM (SELECT id FROM permission WHERE name = '/link') AS p;

-- ============================================
-- 6. 插入组件子菜单
-- ============================================
INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '剪切板', 'Copy', 2, NULL, '/demo/copy', 0, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/demo') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/demo/copy') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '水印', 'Watermark', 2, NULL, '/demo/watermark', 1, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/demo') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/demo/watermark') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '虚拟滚动', 'Virtual Scroll', 2, NULL, '/demo/virtualScroll', 2, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/demo') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/demo/virtualScroll') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '富文本', 'Editor', 2, NULL, '/demo/editor', 3, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/demo') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/demo/editor') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '动态路由参数', 'Dynamic', 2, NULL, '/demo/123/dynamic', 4, 1, NOW(), NOW(), m.id, 0, NULL FROM (SELECT id FROM menu WHERE router = '/demo') AS m;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '层级1', 'Level1', 1, NULL, '/demo/level1', 5, 1, NOW(), NOW(), m.id, 0, NULL FROM (SELECT id FROM menu WHERE router = '/demo') AS m;

-- ============================================
-- 7. 插入层级子菜单
-- ============================================
INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '层级2', 'Level2', 1, NULL, '/demo/level1/level2', 0, 1, NOW(), NOW(), m.id, 0, NULL FROM (SELECT id FROM menu WHERE router = '/demo/level1') AS m;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '层级3', 'Level3', 2, NULL, '/demo/level1/level2/level3', 0, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/demo/level1/level2') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/demo/watermark') AS p;

-- ============================================
-- 8. 插入系统管理子菜单
-- ============================================
INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '用户管理', 'User Management', 2, NULL, '/system/user', 0, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/system') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/authority/user') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '菜单管理', 'Menu Management', 2, NULL, '/system/menu', 1, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/system') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/authority/menu') AS p;

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '角色管理', 'Role Management', 2, NULL, '/system/role', 2, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/system') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/authority/role') AS p;

-- ============================================
-- 9. 插入内容管理子菜单
-- ============================================
INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '文章管理', 'Article Management', 2, NULL, '/content/article', 0, 1, NOW(), NOW(), m.id, 0, p.pid FROM (SELECT id FROM menu WHERE router = '/content') AS m CROSS JOIN (SELECT id AS pid FROM permission WHERE name = '/content/article') AS p;

-- ============================================
-- 10. 插入用户管理按钮菜单（使用变量）
-- ============================================
SET @user_menu_id = (SELECT id FROM menu WHERE router = '/system/user');

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '用户列表', 'Index', 3, NULL, 0, 1, NOW(), NOW(), @user_menu_id, 0, id FROM permission WHERE name = '/authority/user/index';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '查看用户', 'View', 3, NULL, 1, 1, NOW(), NOW(), @user_menu_id, 0, id FROM permission WHERE name = '/authority/user/view';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '创建用户', 'Create', 3, NULL, 2, 1, NOW(), NOW(), @user_menu_id, 0, id FROM permission WHERE name = '/authority/user/create';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '修改用户', 'Update', 3, NULL, 3, 1, NOW(), NOW(), @user_menu_id, 0, id FROM permission WHERE name = '/authority/user/update';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '删除用户', 'Delete', 3, NULL, 4, 1, NOW(), NOW(), @user_menu_id, 0, id FROM permission WHERE name = '/authority/user/delete';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '用户权限按钮', 'Authority', 3, NULL, 5, 1, NOW(), NOW(), @user_menu_id, 0, id FROM permission WHERE name = '/authority/user/authority';

-- ============================================
-- 11. 插入菜单管理按钮菜单
-- ============================================
SET @menu_menu_id = (SELECT id FROM menu WHERE router = '/system/menu');

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '菜单列表', 'Index', 3, NULL, 0, 1, NOW(), NOW(), @menu_menu_id, 0, id FROM permission WHERE name = '/authority/menu/index';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '查看菜单', 'View', 3, NULL, 1, 1, NOW(), NOW(), @menu_menu_id, 0, id FROM permission WHERE name = '/authority/menu/view';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '创建菜单', 'Create', 3, NULL, 2, 1, NOW(), NOW(), @menu_menu_id, 0, id FROM permission WHERE name = '/authority/menu/create';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '修改菜单', 'Update', 3, NULL, 3, 1, NOW(), NOW(), @menu_menu_id, 0, id FROM permission WHERE name = '/authority/menu/update';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '删除菜单', 'Delete', 3, NULL, 4, 1, NOW(), NOW(), @menu_menu_id, 0, id FROM permission WHERE name = '/authority/menu/delete';

-- ============================================
-- 12. 插入角色管理按钮菜单
-- ============================================
SET @role_menu_id = (SELECT id FROM menu WHERE router = '/system/role');

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '角色列表', 'Index', 3, NULL, 0, 1, NOW(), NOW(), @role_menu_id, 0, id FROM permission WHERE name = '/authority/role/index';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '查看角色', 'View', 3, NULL, 1, 1, NOW(), NOW(), @role_menu_id, 0, id FROM permission WHERE name = '/authority/role/view';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '创建角色', 'Create', 3, NULL, 2, 1, NOW(), NOW(), @role_menu_id, 0, id FROM permission WHERE name = '/authority/role/create';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '修改角色', 'Update', 3, NULL, 3, 1, NOW(), NOW(), @role_menu_id, 0, id FROM permission WHERE name = '/authority/role/update';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '删除角色', 'Delete', 3, NULL, 4, 1, NOW(), NOW(), @role_menu_id, 0, id FROM permission WHERE name = '/authority/role/delete';

-- ============================================
-- 13. 插入文章管理按钮菜单
-- ============================================
SET @article_menu_id = (SELECT id FROM menu WHERE router = '/content/article');

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '查看文章', 'View', 3, NULL, 0, 1, NOW(), NOW(), @article_menu_id, 0, id FROM permission WHERE name = '/content/article/view';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '创建文章', 'Create', 3, NULL, 2, 1, NOW(), NOW(), @article_menu_id, 0, id FROM permission WHERE name = '/content/article/create';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '修改文章', 'Update', 3, NULL, 3, 1, NOW(), NOW(), @article_menu_id, 0, id FROM permission WHERE name = '/content/article/update';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '删除文章', 'Delete', 3, NULL, 4, 1, NOW(), NOW(), @article_menu_id, 0, id FROM permission WHERE name = '/content/article/delete';

INSERT INTO menu (label, label_en, type, icon, router, `order`, state, created_at, updated_at, parent_id, is_deleted, permission_id)
SELECT '文章列表', 'Index', 3, NULL, 5, 1, NOW(), NOW(), @article_menu_id, 0, id FROM permission WHERE name = '/content/article/index';

-- ============================================
-- 14. 关联用户与角色
-- ============================================
INSERT INTO `user_role` (user_id, role_id)
SELECT u.id, r.id FROM (SELECT id FROM `user` WHERE username='admin') AS u, (SELECT id FROM `role` WHERE name='系统管理员') AS r;

INSERT INTO `user_role` (user_id, role_id)
SELECT u.id, r.id FROM (SELECT id FROM `user` WHERE username='user1') AS u, (SELECT id FROM `role` WHERE name='普通用户') AS r;

-- ============================================
-- 15. 关联角色与菜单
-- ============================================
INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='仪表盘') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='组件') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='系统管理') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='内容管理') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='外部链接') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='剪切板') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='水印') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='虚拟滚动') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='富文本') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='动态路由参数') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='层级1') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='层级2') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='层级3') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='用户管理') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='菜单管理') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='角色管理') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='文章管理') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='用户列表') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='查看用户') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='创建用户') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='修改用户') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='删除用户') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='用户权限按钮') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='菜单列表') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='查看菜单') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='创建菜单') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='修改菜单') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='删除菜单') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='角色列表') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='查看角色') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='创建角色') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='修改角色') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='删除角色') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='文章列表') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='查看文章') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='创建文章') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='修改文章') AS m;

INSERT INTO `role_menu` (role_id, menu_id)
SELECT r.id, m.id FROM (SELECT id FROM `role` WHERE name='系统管理员') AS r, (SELECT id FROM `menu` WHERE label='删除文章') AS m;

-- ============================================
-- 重新启用外键约束检查
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 导入完成
-- ============================================
