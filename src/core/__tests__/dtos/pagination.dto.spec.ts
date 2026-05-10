import 'reflect-metadata';
import { validate } from 'class-validator';
import { PaginationDto } from 'src/core/dtos/pagination.dto';
import { describe, it, expect } from 'vitest';
import { plainToInstance } from 'class-transformer';

const wrongFormatTests = [
  { property: 'page', value: 'page', constraint: 'isInt' },
  { property: 'page', value: 0, constraint: 'min' },
  { property: 'limit', value: 'limit', constraint: 'isInt' },
  { property: 'limit', value: 0, constraint: 'min' },
  { property: 'limit', value: 10001, constraint: 'max' },
];

describe('Pagination DTO', () => {
  it('should set default values', () => {
    const dto = new PaginationDto();

    expect(dto).toMatchObject({
      page: 1,
      limit: 20,
    });
  });

  it('should transform value to number', () => {
    const plainData = { page: '5', limit: '20' };

    const dto = plainToInstance(PaginationDto, plainData);

    expect(typeof dto.page).toBe('number');
    expect(typeof dto.limit).toBe('number');
  });

  it.each(wrongFormatTests)(
    'throw $constraint constraint error on $property',
    async ({ property, value, constraint }) => {
      const dto = new PaginationDto();

      dto[property] = value;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe(property);
      expect(errors[0].constraints).toHaveProperty(constraint);
    },
  );
});
