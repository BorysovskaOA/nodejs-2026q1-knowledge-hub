import { UserRole } from '@prisma/client';
import { validate } from 'class-validator';
import { CreateUserDto } from 'src/user/models/create-user.dto';
import { describe, it, expect } from 'vitest';

const objWithRequiredFields = {
  login: 'login',
  password: 'password',
};
const wrongFormatTests = [
  { property: 'login', value: 2, constraint: 'isString' },
  { property: 'password', value: 2, constraint: 'isString' },
  { property: 'role', value: 'new', constraint: 'isEnum' },
];

describe('Create User DTO', () => {
  it('should set default values', () => {
    const dto = new CreateUserDto();

    expect(dto).toMatchObject({
      role: UserRole.viewer,
    });
  });

  it.each(Object.keys(objWithRequiredFields))(
    "should fail of '%s' is missing",
    async (field) => {
      const dto = new CreateUserDto();

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
      const dto = new CreateUserDto();

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
