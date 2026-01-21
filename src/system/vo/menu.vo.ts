// 权限列表
export interface AuthorizeMenuTree {
  icon: string;
  key: string;
  title: string;
  type: number;
  value: string;
  children?: AuthorizeMenuTree[];
}
