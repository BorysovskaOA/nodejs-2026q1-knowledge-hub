import { Module } from '@nestjs/common';
import { GeminiModule } from './../gemini/gemini.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiMonitorService } from './ai.monitoring.service';
import { AiArticleController } from './article/ai.article.controller';
import { AiArticleModule } from './article/ai.article.module';

@Module({
  imports: [GeminiModule, AiArticleModule],
  controllers: [AiArticleController, AiController],
  providers: [AiService, AiMonitorService],
  exports: [AiService],
})
export class AiModule {}
