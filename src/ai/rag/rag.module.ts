import { Module } from '@nestjs/common';
import { QdrantModule } from 'src/qdrant/qdrant.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { ArticleModule } from 'src/article/article.module';
import { AiMonitoringModule } from '../monitoring/ai.monitoring.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

import { RagChatModule } from './chat/rag.chat.module';

@Module({
  imports: [
    GeminiModule,
    QdrantModule,
    ArticleModule,
    AiMonitoringModule,
    RagChatModule,
  ],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
