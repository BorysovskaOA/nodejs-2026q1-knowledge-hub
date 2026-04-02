import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dtos/createCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  create(data: CreateCategoryDto) {
    return this.categoryRepository.create(data);
  }

  getAll() {
    return this.categoryRepository.findAll();
  }

  getById(id: string) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  update(id: string, data: CreateCategoryDto) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    return this.categoryRepository.update(id, data);
  }

  delete(id: string) {
    const category = this.categoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException();
    }

    return this.categoryRepository.delete(id);
  }
}
