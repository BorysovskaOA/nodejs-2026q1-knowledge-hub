import { PrismaModule } from './../../../prisma/prisma.module';
import { QdrantModule } from './../../../qdrant/qdrant.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { Module } from '@nestjs/common';
import { AiMonitoringModule } from '../../monitoring/ai.monitoring.module';
import { AiConversationRepository } from './ai-conversation.repository';
import { RagChatService } from './rag.chat.service';
import { RagChatController } from './rag.chat.controller';

@Module({
  imports: [PrismaModule, GeminiModule, QdrantModule, AiMonitoringModule],
  controllers: [RagChatController],
  providers: [RagChatService, AiConversationRepository],
  exports: [RagChatService],
})
export class RagChatModule {}
