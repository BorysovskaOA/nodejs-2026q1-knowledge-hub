import { describe, it, expect, beforeAll } from 'vitest';
import { GlobalValidationPipe } from 'src/core/pipes/global-validation.pipe';
import { Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';
import { BadRequestError } from 'src/core/exceptions/app-errors';

class TestDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsInt()
  age: number;
}

describe('Global Validation Pipe', () => {
  let pipe: GlobalValidationPipe;

  beforeAll(() => {
    pipe = new GlobalValidationPipe();
  });

  it('returns validated data', async () => {
    const value = { name: 'Ivan', age: 25 };
    const metadata = { type: 'body', metatype: TestDto } as any;

    const result = await pipe.transform(value, metadata);

    expect(result).toEqual(value);
  });

  it('throws BadRequestError with formatted errors if validation fails', async () => {
    const invalidValue = { name: 123, age: 'not-a-number' };
    const metadata = { type: 'body', metatype: TestDto } as any;

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      const response = error.getResponse() as any;

      expect(response.description).toEqual({
        name: [expect.any(String)],
        age: [expect.any(String)],
      });
    }
  });

  it('throws BadRequestError when contain non-whitelisted properties', async () => {
    const value = { name: 'Ivan', age: 25, hacker: 'hack' };
    const metadata = { type: 'body', metatype: TestDto } as any;

    try {
      await pipe.transform(value, metadata);
    } catch (err) {
      expect(err).toBeInstanceOf(BadRequestError);
      const response = err.getResponse();
      expect(response.description).toEqual({
        hacker: [expect.any(String)],
      });
    }
  });

  it('transforms types with @Type', async () => {
    const value = { name: 'Ivan', age: '25' };
    const metadata = { type: 'body', metatype: TestDto } as any;

    const result = await pipe.transform(value, metadata);

    expect(typeof result.age).toBe('number');
    expect(result.age).toBe(25);
  });
});
