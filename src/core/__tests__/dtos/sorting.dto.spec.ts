import { validate } from 'class-validator';
import { describe, it, expect } from 'vitest';
import { SortOrder, WithSortingDto } from 'src/core/dtos/sorting.dto';

interface TestSortEntity {
  createdAt: string;
}

const wrongFormatTests = [
  { property: 'sortKey', value: 'other', constraint: 'isIn' },
  { property: 'sortKey', value: 2, constraint: 'isString' },
  { property: 'sortOrder', value: 0, constraint: 'isEnum' },
];

describe('Sorting DTO', () => {
  it('should set default values by WithSortingDto', () => {
    const SortingDto = WithSortingDto<TestSortEntity>(
      ['createdAt'],
      'createdAt',
      SortOrder.ASC,
    );

    const dto = new SortingDto();

    expect(dto).toMatchObject({
      sortKey: 'createdAt',
      sortOrder: SortOrder.ASC,
    });
  });

  it.each(wrongFormatTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const SortingDto = WithSortingDto<TestSortEntity>(
        ['createdAt'],
        'createdAt',
        SortOrder.ASC,
      );

      const dto = new SortingDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
