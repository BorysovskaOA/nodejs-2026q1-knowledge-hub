import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './categoty.service';
import { CategoryRepository } from './category.repository';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
