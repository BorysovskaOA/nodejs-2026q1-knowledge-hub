import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './categoty.service';

@Module({
  imports: [],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
