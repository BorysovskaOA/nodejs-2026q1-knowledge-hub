import { Injectable } from '@nestjs/common';
import { Category } from './interfaces/category.interface';

@Injectable()
export class CategoryService {
  private categories: Category[] = [];

  create(category: Category) {
    this.categories.push(category);
  }

  getAll() {
    return this.categories;
  }

  getById(id: string) {
    return this.categories.find((c) => c.id === id);
  }

  update(id: string, category: Category) {
    this.categories = this.categories.map((c) => (c.id === id ? category : c));
  }

  delete(id: string) {
    this.categories = this.categories.filter((c) => c.id !== id);
  }
}
