import { Module } from '@nestjs/common';
import { GeminiModule } from './../gemini/gemini.module';
import { ArticleModule } from 'src/article/article.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiMonitorService } from './ai.monitoring.service';

@Module({
  imports: [GeminiModule, ArticleModule],
  controllers: [AiController],
  providers: [AiService, AiMonitorService],
  exports: [AiService],
})
export class AiModule {}
