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
import { pinoConfig } from './core/configs/logger.config';
import { throttlerConfig } from './core/configs/throttler.config';
import { CustomExceptionFilter } from './core/exceptions/custom-exception.filter';
import { AiModule } from './ai/ai.module';
import { GeminiModule } from './gemini/gemini.module';
import { CustomThrottlerGuard } from './core/guards/custom-throttler.guard';
import { QdrantModule } from './qdrant/qdrant.module';

@Module({
  imports: [
    LoggerModule.forRoot(pinoConfig),
    ThrottlerModule.forRoot(throttlerConfig),
    CacheModule.register({
      isGlobal: true,
      ttl: Number(process.env.CACHE_TTL),
    }),
    HealthModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    UserModule,
    AuthModule,
    GeminiModule,
    QdrantModule,
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
export class AppModule {}
