import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('content_article')
export class Article extends BaseEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ length: 100, nullable: true })
  author: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'int', default: 1, comment: '1=published, 0=draft' })
  status: number;

  @Column({ length: 50, nullable: true })
  createdUser: string;

  @Column({ length: 50, nullable: true })
  updatedUser: string;
}
