import { Module } from '@nestjs/common';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [ArticleModule],
  exports: [ArticleModule],
})
export class ContentsModule {}
