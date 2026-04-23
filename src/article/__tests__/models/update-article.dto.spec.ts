import { validate } from 'class-validator';
import { UpdateArticleDto } from 'src/article/models/update-article.dto';
import { describe, it, expect } from 'vitest';

const wrongFormatTests = [
  { property: 'title', value: 2, constraint: 'isString' },
  { property: 'content', value: 2, constraint: 'isString' },
  { property: 'status', value: 'new', constraint: 'isEnum' },
  { property: 'categoryId', value: 'categoryId', constraint: 'isUuid' },
  { property: 'tags', value: 'tag', constraint: 'isArray' },
  { property: 'tags', value: [2], constraint: 'isString' },
];

describe('Update Article DTO', () => {
  it('should not set default values', () => {
    const dto = new UpdateArticleDto();

    expect(dto).toMatchObject({});
  });

  it.each(wrongFormatTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new UpdateArticleDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
