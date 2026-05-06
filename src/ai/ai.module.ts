import { Module } from '@nestjs/common';
import { GeminiModule } from './../gemini/gemini.module';
import { ArticleModule } from 'src/article/article.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { CacheModule } from '@nestjs/cache-manager';
import 'dotenv/config';
import { AiMonitorService } from './ai.monitoring.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: Number(process.env.AI_CACHE_TTL_SEC) * 1000,
    }),
    GeminiModule,
    ArticleModule,
  ],
  controllers: [AiController],
  providers: [AiService, AiMonitorService],
  exports: [AiService],
})
export class AiModule {}
