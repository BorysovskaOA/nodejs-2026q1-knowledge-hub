import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger;

  constructor(connectionString: string) {

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
    this.logger = new Logger('DATABASE');
  }

  async onModuleInit() {
    await this.$connect();

    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.verbose(
        {
          query: e.query,
          duration: `${e.duration}ms`,
        },
        'DB Query:',
      );
    });

    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.verbose({ taget: e.target, message: e.message }, 'DB Error:');
    });

    this.$on('warn', (e: Prisma.LogEvent) => {
      this.logger.verbose({ taget: e.target, message: e.message }, 'DB Warn:');
    });

    this.$on('info', (e: Prisma.LogEvent) => {
      this.logger.verbose({ taget: e.target, message: e.message }, 'DB Info:');
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
