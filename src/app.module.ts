import { Module } from '@nestjs/common';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalResponseTransformInterceptor } from './utils/resposneTransform.interceptor';

@Module({
  imports: [ArticleModule, CategoryModule, CommentModule, UserModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
