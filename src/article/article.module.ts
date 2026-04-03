import { forwardRef, Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { ArticleRepository } from './article.repository';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    forwardRef(() => CategoryModule),
    forwardRef(() => UserModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
  exports: [ArticleService],
})
export class ArticleModule {}
