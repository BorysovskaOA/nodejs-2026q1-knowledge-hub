import { Module } from '@nestjs/common';
import { ArticleModule } from 'src/article/article.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { AiArticleController } from './ai.article.controller';
import { AiArticleService } from './ai.article.service';

@Module({
  imports: [GeminiModule, ArticleModule],
  controllers: [AiArticleController],
  providers: [AiArticleService],
  exports: [AiArticleService],
})
export class AiArticleModule {}
