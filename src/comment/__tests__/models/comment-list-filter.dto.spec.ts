import { validate } from 'class-validator';
import { randomUUID } from 'crypto';
import 'reflect-metadata';
import {
  CommentListFiltersDto,
  CommentListFiltersPaginatedDto,
} from 'src/comment/models/comment-list-filter.dto';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { describe, it, expect } from 'vitest';

const wrongFormatTests = [
  { property: 'articleId', value: 'articleId', constraint: 'isUuid' },
];

const wrongFormatPaginatedTests = [
  { property: 'sortKey', value: 'other', constraint: 'isIn' },
];

describe('ArticleListFiltersDto', () => {
  it("should fail of 'articleId' is missing", async () => {
    const dto = new CommentListFiltersDto();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('articleId');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it.each(wrongFormatTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new CommentListFiltersDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});

describe('ArticleListFiltersPaginatedDto', () => {
  it('should not set default values', () => {
    const dto = new CommentListFiltersPaginatedDto();

    expect(dto).toMatchObject({
      page: 1,
      limit: 20,
      sortKey: 'createdAt',
      sortOrder: SortOrder.ASC,
    });
  });

  it.each(wrongFormatPaginatedTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new CommentListFiltersPaginatedDto();
      dto.articleId = randomUUID();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
