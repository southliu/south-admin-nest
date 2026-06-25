import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('sys_log')
export class Log extends BaseEntity {
  @Column({ length: 20, nullable: true })
  username: string;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  method: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  params: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @Column({ length: 50, nullable: true })
  status: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'int', nullable: true })
  latency: number;

  @Column({
    type: 'int',
    default: 1,
    comment: '0=error, 1=success, 3=frontend',
  })
  type: number;
}
