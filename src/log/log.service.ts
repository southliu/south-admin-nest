import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { QueryLogDto, CreateLogDto } from './dto/log.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
  ) {}

  async page(dto: QueryLogDto) {
    const { page = 1, pageSize = 10, username, ip, url, status, type } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.logRepository.createQueryBuilder('log');

    if (username) {
      queryBuilder.andWhere('log.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (ip) {
      queryBuilder.andWhere('log.ip LIKE :ip', { ip: `%${ip}%` });
    }

    if (url) {
      queryBuilder.andWhere('log.url LIKE :url', { url: `%${url}%` });
    }

    if (status) {
      queryBuilder.andWhere('log.status LIKE :status', {
        status: `%${status}%`,
      });
    }

    if (type !== undefined) {
      queryBuilder.andWhere('log.type = :type', { type });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('log.createdAt', 'DESC')
      .getManyAndCount();

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(createLogDto: CreateLogDto) {
    const log = this.logRepository.create(createLogDto);
    return await this.logRepository.save(log);
  }

  async detail(id: number) {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) {
      return null;
    }
    return log;
  }

  async delete(id: number) {
    const log = await this.logRepository.findOne({ where: { id } });
    if (!log) {
      return null;
    }
    await this.logRepository.remove(log);
    return { message: '删除成功' };
  }

  async deleteBatch(ids: number[]) {
    await this.logRepository.delete(ids);
    return { message: '批量删除成功' };
  }
}
