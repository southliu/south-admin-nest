import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

@Controller('content/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('page')
  async page(@Query() dto: any) {
    return await this.articleService.page(dto);
  }

  @Get('detail')
  async detail(@Query('id') id: number) {
    return await this.articleService.detail(id);
  }

  @Post('create')
  async create(@Body() createArticleDto: CreateArticleDto) {
    return await this.articleService.create(createArticleDto);
  }

  @Put('update/:id')
  async update(@Param('id') id: number, @Body() updateArticleDto: UpdateArticleDto) {
    return await this.articleService.update(id, updateArticleDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    await this.articleService.delete(id);
    return { message: 'Article deleted successfully' };
  }

  @Get('list')
  async list() {
    return await this.articleService.list();
  }
}
