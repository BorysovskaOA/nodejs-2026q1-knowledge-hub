import { sort } from './../core/utils/sort.util';
import { Injectable } from '@nestjs/common';
import { Category } from './category.interface';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { BaseRepository } from 'src/core/base.repository';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  findAll(): Category[] {
    // Always sorted categories
    const items = sort(this.items, 'name', SortOrder.ASC);

    return items;
  }
}
