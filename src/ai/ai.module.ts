import { Module } from '@nestjs/common';
import { GeminiModule } from './../gemini/gemini.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiArticleController } from './article/ai.article.controller';
import { AiArticleModule } from './article/ai.article.module';
import { AiMonitoringModule } from './monitoring/ai.monitoring.module';

@Module({
  imports: [GeminiModule, AiMonitoringModule, AiArticleModule],
  controllers: [AiArticleController, AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
