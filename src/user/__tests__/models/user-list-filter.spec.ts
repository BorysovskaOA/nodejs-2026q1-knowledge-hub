import { validate } from 'class-validator';
import 'reflect-metadata';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { UserListFiltersPaginatedDto } from 'src/user/models/user-list-filter.dto';
import { describe, it, expect } from 'vitest';

const wrongFormatPaginatedTests = [
  { property: 'sortKey', value: 'other', constraint: 'isIn' },
];

describe('UserListFiltersPaginatedDto', () => {
  it('should set default values', () => {
    const dto = new UserListFiltersPaginatedDto();

    expect(dto).toMatchObject({
      page: 1,
      limit: 20,
      sortKey: 'login',
      sortOrder: SortOrder.ASC,
    });
  });

  it.each(wrongFormatPaginatedTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new UserListFiltersPaginatedDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
