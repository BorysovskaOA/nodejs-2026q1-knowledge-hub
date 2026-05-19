import { Injectable } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { GeminiService } from 'src/gemini/gemini.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
    private qdrantService: QdrantService,
    private geminiService: GeminiService,
  ) {}

  async check() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma),
      async () => {
        await this.qdrantService.getCollections();
        return { qdrant: { status: 'up' } };
      },
      async () => {
        await this.geminiService.getAvailableModelsList();
        return { gemini: { status: 'up' } };
      },
    ]);
  }
}
