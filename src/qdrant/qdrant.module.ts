import { Global, Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';
import { GeminiModule } from 'src/gemini/gemini.module';

@Global()
@Module({
  imports: [GeminiModule],
  providers: [QdrantService],
  exports: [QdrantService],
})
export class QdrantModule {}
