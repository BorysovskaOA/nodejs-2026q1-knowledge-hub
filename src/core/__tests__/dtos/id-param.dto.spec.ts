import { validate } from 'class-validator';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { describe, it, expect } from 'vitest';

const wrongFormatTests = [
  { property: 'id', value: 'id', constraint: 'isUuid' },
];

describe('Id Param DTO', () => {
  it("should fail of 'id' is missing", async () => {
    const dto = new IdParamDto();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('id');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it.each(wrongFormatTests)(
    "throw 'isUuuid' constraint error on 'id'",
    async () => {
      const dto = new IdParamDto();

      dto.id = 'id';

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    },
  );
});
