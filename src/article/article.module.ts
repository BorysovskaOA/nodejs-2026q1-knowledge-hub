import { forwardRef, Module } from '@nestjs/common';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { RagModule } from 'src/ai/rag/rag.module';

@Module({
  imports: [
    PrismaModule,
    CategoryModule,
    UserModule,
    forwardRef(() => RagModule),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
  exports: [ArticleService],
})
export class ArticleModule {}
