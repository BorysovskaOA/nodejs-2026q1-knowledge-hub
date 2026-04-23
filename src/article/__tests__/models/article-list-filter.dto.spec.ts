import { validate } from 'class-validator';
import 'reflect-metadata';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatedDto,
} from 'src/article/models/article-list-filter.dto';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { describe, it, expect } from 'vitest';

const wrongFormatTests = [
  { property: 'status', value: 'new', constraint: 'isEnum' },
  { property: 'categoryId', value: 'categoryId', constraint: 'isUuid' },
  { property: 'tag', value: [2], constraint: 'isString' },
];

const wrongFormatPaginatedTests = [
  { property: 'sortKey', value: 'other', constraint: 'isIn' },
];

describe('ArticleListFiltersDto', () => {
  it('should not set default values', () => {
    const dto = new ArticleListFiltersDto();

    expect(dto).toMatchObject({});
  });

  it.each(wrongFormatTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new ArticleListFiltersDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});

describe('ArticleListFiltersPaginatedDto', () => {
  it('should set default values', () => {
    const dto = new ArticleListFiltersPaginatedDto();

    expect(dto).toMatchObject({
      page: 1,
      limit: 20,
      sortKey: 'createdAt',
      sortOrder: SortOrder.DESC,
    });
  });

  it.each(wrongFormatPaginatedTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new ArticleListFiltersPaginatedDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
