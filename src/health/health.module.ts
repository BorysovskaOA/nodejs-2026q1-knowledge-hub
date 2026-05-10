import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { GeminiModule } from 'src/gemini/gemini.module';
import { QdrantModule } from 'src/qdrant/qdrant.module';

@Module({
  imports: [TerminusModule, PrismaModule, GeminiModule, QdrantModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
