import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { GlobalValidationPipe } from './core/pipes/global-validation.pipe';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { AuthzGuard } from './core/guards/authz.guard';
import { getPinoConfig } from './core/configs/logger.config';
import { CustomExceptionFilter } from './core/exceptions/custom-exception.filter';
import { AiModule } from './ai/ai.module';
import { GeminiModule } from './gemini/gemini.module';
import { CustomThrottlerGuard } from './core/guards/custom-throttler.guard';
import { QdrantModule } from './qdrant/qdrant.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables, envSchema } from './core/configs/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config)
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables, true>) => {
        return getPinoConfig(configService);
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables, true>) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get('RATE_LIMIT_TTL'),
            limit: configService.get('RATE_LIMIT'),
          },
          {
            name: 'auth',
            ttl: configService.get('RATE_LIMIT_TTL'),
            limit: configService.get('RATE_LIMIT_AUTH'),
          },
          {
            name: 'ai',
            ttl: configService.get('RATE_LIMIT_TTL'),
            limit: configService.get('RATE_LIMIT_AI'),
          },
        ],
        default: 'default',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvironmentVariables, true>) => ({
        ttl: configService.get('CACHE_TTL'),
      })
    }),
    GeminiModule,
    QdrantModule,
    HealthModule,
    UserModule,
    CategoryModule,
    ArticleModule,
    CommentModule,
    AuthModule,
    AiModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: CustomExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_PIPE, useClass: GlobalValidationPipe },
    { provide: APP_GUARD, useClass: AuthzGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule { }
