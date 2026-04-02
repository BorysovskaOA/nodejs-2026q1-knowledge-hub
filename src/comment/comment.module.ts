import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ArticleModule } from 'src/article/article.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ArticleModule, UserModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
