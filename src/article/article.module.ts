import { forwardRef, Module } from '@nestjs/common';
import { CategoryModule } from 'src/category/category.module';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CategoryModule),
    forwardRef(() => UserModule),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
  exports: [ArticleService],
})
export class ArticleModule {}
