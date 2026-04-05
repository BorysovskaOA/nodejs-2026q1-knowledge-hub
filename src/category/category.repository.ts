import { sort } from './../core/utils/sort.util';
import { Injectable } from '@nestjs/common';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { BaseRepository } from 'src/core/base.repository';
import { CategoryEntity } from './models/category.entity';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity> {
  constructor() {
    super(CategoryEntity);
  }

  findAll(): CategoryEntity[] {
    // Always sorted categories
    const items = sort(this.items, 'name', SortOrder.ASC);

    return items;
  }
}
