import { describe, it, expect, beforeAll } from 'vitest';
import { GlobalValidationPipe } from 'src/core/pipes/global-validation.pipe';
import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

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

  it('throws BadRequestException with formatted errors if validation fails', async () => {
    const invalidValue = { name: 123, age: 'not-a-number' };
    const metadata = { type: 'body', metatype: TestDto } as any;

    try {
      await pipe.transform(invalidValue, metadata);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const { message } = error.getResponse() as any;

      expect(message).toBeInstanceOf(Array);
      expect(message[0]).toMatchObject({
        field: 'name',
        errors: expect.arrayContaining([expect.any(String)]),
      });
      expect(message[1]).toMatchObject({
        field: 'age',
        errors: expect.arrayContaining([expect.any(String)]),
      });
    }
  });

  it('throws BadRequestException when contain non-whitelisted properties', async () => {
    const value = { name: 'Ivan', age: 25, hacker: 'hack' };
    const metadata = { type: 'body', metatype: TestDto } as any;

    await expect(pipe.transform(value, metadata)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('transforms types with @Type', async () => {
    const value = { name: 'Ivan', age: '25' };
    const metadata = { type: 'body', metatype: TestDto } as any;

    const result = await pipe.transform(value, metadata);

    expect(typeof result.age).toBe('number');
    expect(result.age).toBe(25);
  });
});
