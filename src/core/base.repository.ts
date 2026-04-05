import { SortType } from './dtos/sorting.dto';
import { Injectable } from '@nestjs/common';
import { paginate } from './utils/paginate.util';
import { sort } from './utils/sort.util';
import { PaginationDto } from './dtos/pagination.dto';
import { BaseEntity } from './base.entity';
import { PaginatedResponseDto } from './dtos/paginated-response.dto';

type EntityConstructor<T> = new (data: Partial<T>) => T;

@Injectable()
export class BaseRepository<T extends BaseEntity<T>> {
  protected items: T[] = [];

  constructor(private readonly entityConstructor: EntityConstructor<T>) {}

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
  }: S): PaginatedResponseDto<T> {
    let items = this.findAll(restFilter);
    const total = items.length;

    if (sortKey) {
      items = sort(items, sortKey as string, sortOrder);
    }
    items = paginate(items, page, limit);

    return new PaginatedResponseDto(items, total, page, limit);
  }

  findAllRelated(proName: keyof T, value: any): T[] {
    return this.items.filter((a) => a[proName] === value);
  }

  findOne(id: string): T | undefined {
    return this.items.find((c) => c.id === id);
  }

  create(data: Partial<T>): T {
    const item = new this.entityConstructor(data);

    this.items.push(item);

    return item;
  }

  update(id: string, data: Partial<T>): T | undefined {
    const entity = this.findOne(id);
    if (!entity) return undefined;

    (entity as any).update(data);

    return entity;
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
