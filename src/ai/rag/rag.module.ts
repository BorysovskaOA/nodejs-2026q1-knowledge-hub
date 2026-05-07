import { QdrantModule } from './../../qdrant/qdrant.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { ArticleModule } from 'src/article/article.module';

@Module({
  imports: [GeminiModule, QdrantModule, ArticleModule],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
