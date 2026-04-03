import { forwardRef, Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { ArticleModule } from 'src/article/article.module';
import { UserModule } from 'src/user/user.module';
import { CommentRepository } from './comment.repository';

@Module({
  imports: [forwardRef(() => ArticleModule), forwardRef(() => UserModule)],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentService],
})
export class CommentModule {}
