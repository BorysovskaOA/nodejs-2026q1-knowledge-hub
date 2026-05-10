import { ArticleStatus } from '@prisma/client';
import { validate } from 'class-validator';
import { CreateArticleDto } from 'src/article/models/create-article.dto';
import { describe, it, expect } from 'vitest';

const objWithRequiredFields = {
  title: 'Title',
  content: 'Content',
};
const wrongFormatTests = [
  { property: 'title', value: 2, constraint: 'isString' },
  { property: 'content', value: 2, constraint: 'isString' },
  { property: 'status', value: 'new', constraint: 'isEnum' },
  { property: 'authorId', value: 'authorId', constraint: 'isUuid' },
  { property: 'categoryId', value: 'categoryId', constraint: 'isUuid' },
  { property: 'tags', value: 'tag', constraint: 'isArray' },
  { property: 'tags', value: [2], constraint: 'isString' },
];

describe('Create Article DTO', () => {
  it('should set default values', () => {
    const dto = new CreateArticleDto();

    expect(dto).toMatchObject({
      status: ArticleStatus.draft,
      authorId: null,
      categoryId: null,
      tags: [],
    });
  });

  it.each(Object.keys(objWithRequiredFields))(
    "should fail of '%s' is missing",
    async (field) => {
      const dto = new CreateArticleDto();

      Object.keys(objWithRequiredFields).forEach((f) => {
        if (f === field) return;
        dto[f] = objWithRequiredFields[f];
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(field);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    },
  );

  it.each(wrongFormatTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new CreateArticleDto();

      Object.keys(objWithRequiredFields).forEach((f) => {
        dto[f] = objWithRequiredFields[f];
      });

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
