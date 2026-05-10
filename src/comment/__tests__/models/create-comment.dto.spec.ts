import { validate } from 'class-validator';
import { randomUUID } from 'crypto';
import { CreateCommentDto } from 'src/comment/models/create-comment.dto';
import { describe, it, expect } from 'vitest';

const objWithRequiredFields = {
  content: 'Content',
  articleId: randomUUID(),
};
const wrongFormatTests = [
  { property: 'content', value: 2, constraint: 'isString' },
  { property: 'authorId', value: 'authorId', constraint: 'isUuid' },
  { property: 'articleId', value: 'articleId', constraint: 'isUuid' },
];

describe('Create Comment DTO', () => {
  it('should set default values', () => {
    const dto = new CreateCommentDto();

    expect(dto).toMatchObject({
      authorId: null,
    });
  });

  it.each(Object.keys(objWithRequiredFields))(
    "should fail of '%s' is missing",
    async (field) => {
      const dto = new CreateCommentDto();

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
      const dto = new CreateCommentDto();

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
