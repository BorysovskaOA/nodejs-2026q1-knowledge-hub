import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';

import { GlobalResponseTransformInterceptor } from './core/interceptors/global-resposne-transform.interceptor';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';
import { GlobalValidationPipe } from './core/pipes/global-validation.pipe';

@Module({
  imports: [ArticleModule, CategoryModule, CommentModule, UserModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: GlobalValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseTransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
