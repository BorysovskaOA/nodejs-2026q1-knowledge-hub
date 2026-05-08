import { Module } from '@nestjs/common';
import { GeminiModule } from './../gemini/gemini.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiArticleModule } from './article/ai.article.module';
import { AiMonitoringModule } from './monitoring/ai.monitoring.module';
import { RagModule } from './rag/rag.module';
import { AiConversationRepository } from './rag/ai-conversation.repository';

@Module({
  imports: [GeminiModule, AiMonitoringModule, AiArticleModule, RagModule],
  controllers: [AiController],
  providers: [AiService, AiConversationRepository],
  exports: [AiService],
})
export class AiModule {}
