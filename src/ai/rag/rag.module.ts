import { PrismaModule } from './../../prisma/prisma.module';
import { QdrantModule } from './../../qdrant/qdrant.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { ArticleModule } from 'src/article/article.module';
import { AiMonitoringModule } from '../monitoring/ai.monitoring.module';
import { AiConversationRepository } from './ai-conversation.repository';

@Module({
  imports: [
    PrismaModule,
    GeminiModule,
    QdrantModule,
    ArticleModule,
    AiMonitoringModule,
  ],
  controllers: [RagController],
  providers: [RagService, AiConversationRepository],
  exports: [RagService],
})
export class RagModule {}
