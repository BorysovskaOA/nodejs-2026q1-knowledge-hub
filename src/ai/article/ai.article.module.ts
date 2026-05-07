import { Module } from '@nestjs/common';
import { ArticleModule } from 'src/article/article.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { AiArticleController } from './ai.article.controller';
import { AiArticleService } from './ai.article.service';
import { AiMonitoringModule } from '../monitoring/ai.monitoring.module';

@Module({
  imports: [GeminiModule, ArticleModule, AiMonitoringModule],
  controllers: [AiArticleController],
  providers: [AiArticleService],
  exports: [AiArticleService],
})
export class AiArticleModule {}
