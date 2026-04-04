import { SortType } from './dtos/sorting.dto';
import { Injectable } from '@nestjs/common';
import { paginate } from './utils/paginate.util';
import { sort } from './utils/sort.util';
import { PaginatedResponse } from './interfaces/paginated-response.interface';
import { PaginationDto } from './dtos/pagination.dto';

@Injectable()
export class BaseRepository<T extends { id: string }> {
  protected items: T[] = [];

  findAll(filter: Record<string, any> = {}): T[] {
    const filterKeys = Object.keys(filter);

    if (filterKeys.length === 0) return this.items;

    return this.items.filter((item: any) => {
      return filterKeys.every((key) => {
        if (filter[key] === undefined) return true;

        return item[key] === filter[key];
      });
    });
  }

  findAllPaginated<S extends PaginationDto & SortType<T>>({
    page,
    limit,
    sortKey,
    sortOrder,
    ...restFilter
  }: S): PaginatedResponse<T> {
    let items = this.findAll(restFilter);

    if (sortKey) {
      items = sort(items, sortKey as string, sortOrder);
    }
    items = paginate(items, page, limit);

    return {
      data: items,
      page,
      limit,
      total: this.items.length,
    };
  }

  findAllRelated(proName: keyof T, value: any): T[] {
    return this.items.filter((a) => a[proName] === value);
  }

  findOne(id: string): T | undefined {
    return this.items.find((c) => c.id === id);
  }

  create(data: Omit<T, 'id'>): T {
    const item = {
      id: crypto.randomUUID() as string,
      ...data,
    } as T;

    this.items.push(item);

    return item;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const index = this.items.findIndex((c) => c.id === id);
    if (index === -1) return;

    this.items[index] = {
      ...this.items[index],
      ...data,
    };

    return this.items[index];
  }

  updateBatch(items: (Partial<T> & Pick<T, 'id'>)[]): (string | undefined)[] {
    return items.map((a) => {
      const updatedItem = this.update(a.id, a);

      return updatedItem?.id;
    });
  }

  delete(id: string): boolean {
    const updatedItems = this.items.filter((c) => c.id !== id);
    const updated = this.items.length !== updatedItems.length;
    this.items = updatedItems;
    return updated;
  }

  deleteBatch(ids: string[]): number {
    const updatedItems = this.items.filter((c) => !ids.includes(c.id));
    const updated = this.items.length - updatedItems.length;
    this.items = updatedItems;
    return updated;
  }
}
