import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('sys_menu')
@Tree('closure-table')
export class Menu extends BaseEntity {
  @Column({ length: 50 })
  label: string;

  @Column({ name: 'label_en', length: 50 })
  labelEn: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ type: 'int', comment: '1=directory, 2=menu, 3=button' })
  type: number;

  @Column({ length: 255, nullable: true })
  router: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'int', default: 1, comment: '0=hidden, 1=visible' })
  state: number;

  @ManyToOne(() => Menu, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @TreeParent()
  parentMenu: Menu;

  @TreeChildren()
  children: Menu[];

  @ManyToOne(() => Permission, { nullable: true })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @ManyToMany(() => Role)
  roles: Role[];

  key: string;
}
