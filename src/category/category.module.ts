import { forwardRef, Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './categoty.service';
import { CategoryRepository } from './category.repository';
import { ArticleModule } from 'src/article/article.module';

@Module({
  imports: [forwardRef(() => ArticleModule)],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
