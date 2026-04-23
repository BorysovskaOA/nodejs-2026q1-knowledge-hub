import { describe, it, expect, beforeAll } from 'vitest';
import { UnauthorizedValidationPipe } from '../unauthorized-validation.pipe';
import { UnauthorizedException } from '@nestjs/common';
import { IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class TestDto {
  @IsString()
  username: string;

  @Type(() => Number)
  @IsInt()
  age: number;
}

describe('Unauthorized Validation Pipe', () => {
  let pipe: UnauthorizedValidationPipe;

  beforeAll(() => {
    pipe = new UnauthorizedValidationPipe();
  });

  it('returns validated data', async () => {
    const validData = { username: 'alice', age: 25 };
    const result = await pipe.transform(validData, {
      metatype: TestDto,
      type: 'body',
    });
    expect(result).toEqual(validData);
  });

  it('throws UnauthorizedException if validation fails', async () => {
    const invalidData = { username: 'alice', age: 'not-a-number' };
    await expect(
      pipe.transform(invalidData, { metatype: TestDto, type: 'body' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('returns the value if no metatype is provided', async () => {
    const data = { foo: 'bar' };
    const result = await pipe.transform(data, {
      metatype: undefined,
      type: 'body',
    });
    expect(result).toBe(data);
  });
});
