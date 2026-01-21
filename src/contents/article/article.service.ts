import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async page(dto: PaginationDto & { title?: string; status?: number }) {
    const { page = 1, pageSize = 10, title, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .where('article.isDeleted = :isDeleted', { isDeleted: 0 });

    if (title) {
      queryBuilder.andWhere('article.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('article.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('article.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async detail(id: number) {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article || article.isDeleted === 1) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async create(createArticleDto: CreateArticleDto) {
    const { title, author, content, status, createdUser } = createArticleDto;

    const article = this.articleRepository.create({
      title,
      author,
      content,
      status: status !== undefined ? status : 1,
      createdUser,
    });

    return await this.articleRepository.save(article);
  }

  async update(id: number, updateArticleDto: UpdateArticleDto) {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article || article.isDeleted === 1) {
      throw new NotFoundException('Article not found');
    }

    const { title, author, content, status, updatedUser } = updateArticleDto;

    article.title = title;
    article.author = author;
    article.content = content;
    article.status = status !== undefined ? status : article.status;
    article.updatedUser = updatedUser;

    return await this.articleRepository.save(article);
  }

  async delete(id: number) {
    const article = await this.articleRepository.findOne({ where: { id } });

    if (!article || article.isDeleted === 1) {
      throw new NotFoundException('Article not found');
    }

    article.isDeleted = 1;
    article.deletedAt = new Date();
    await this.articleRepository.save(article);
  }

  async list() {
    return await this.articleRepository.find({
      where: { isDeleted: 0, status: 1 },
      select: ['id', 'title', 'author', 'createdAt', 'updatedAt'],
    });
  }
}
