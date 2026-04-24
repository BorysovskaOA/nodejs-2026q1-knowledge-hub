import { HealthModule } from './health/health.module';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { GlobalValidationPipe } from './core/pipes/global-validation.pipe';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { AuthzGuard } from './core/guards/authz.guard';
import { pinoConfig } from './core/configs/logger.config';
import { throttlerConfig } from './core/configs/throttler.config';
import { ExceptionFilter } from './core/exceptions/custom-exception.filter';

@Module({
  imports: [
    LoggerModule.forRoot(pinoConfig),
    ThrottlerModule.forRoot(throttlerConfig),
    HealthModule,
    ArticleModule,
    CategoryModule,
    CommentModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_PIPE, useClass: GlobalValidationPipe },
    { provide: APP_GUARD, useClass: AuthzGuard },
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class AppModule {}
