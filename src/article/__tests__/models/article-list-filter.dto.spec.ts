import { validate } from 'class-validator';
import 'reflect-metadata';
import { ArticleListFiltersDto } from 'src/article/models/article-list-filter.dto';
import { describe, it, expect } from 'vitest';

const wrongFormatTests = [
  { property: 'status', value: 'new', constraint: 'isEnum' },
  { property: 'categoryId', value: 'categoryId', constraint: 'isUuid' },
  { property: 'tag', value: [2], constraint: 'isString' },
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
