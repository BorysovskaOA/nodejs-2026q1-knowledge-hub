import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [TerminusModule, PrismaModule],
})
export class HealthModule {}
