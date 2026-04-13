import { HealthModule } from './health/health.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';

import { LoggerMiddleware } from './core/middlewares/logger.middleware';
import { GlobalValidationPipe } from './core/pipes/global-validation.pipe';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ArticleModule,
    CategoryModule,
    CommentModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: GlobalValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
