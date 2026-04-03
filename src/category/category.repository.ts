import { Injectable } from '@nestjs/common';
import { Category } from './category.interface';

@Injectable()
export class CategoryRepository {
  private categories: Category[] = [];

  findAll(): Category[] {
    return this.categories;
  }

  findOne(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id);
  }

  create(caregoryData: Omit<Category, 'id'>): Category {
    const category: Category = {
      id: crypto.randomUUID(),
      ...caregoryData,
    };

    this.categories.push(category);

    return category;
  }

  update(id: string, categoryData: Partial<Category>): Category | undefined {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) return;

    this.categories[index] = {
      ...this.categories[index],
      ...categoryData,
    };

    return this.categories[index];
  }

  delete(id: string): boolean {
    const updatedCategories = this.categories.filter((u) => u.id !== id);
    const updated = this.categories.length !== updatedCategories.length;
    this.categories = updatedCategories;
    return updated;
  }
}
