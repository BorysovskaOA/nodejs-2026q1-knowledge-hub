import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/core/configs/env.config';

@Global()
@Module({
  providers: [{
    provide: PrismaService,
    inject: [ConfigService],
    useFactory: (configService: ConfigService<EnvironmentVariables, true>) => new PrismaService(configService.get('DATABASE_URL')),
  }],
  exports: [PrismaService],
})
export class PrismaModule { }
