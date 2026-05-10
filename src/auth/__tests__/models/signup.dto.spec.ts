import { validate } from 'class-validator';
import { SignupDto } from 'src/auth/models/signup.dto';
import { describe, it, expect } from 'vitest';

const objWithRequiredFields = {
  login: 'login',
  password: 'password',
};
const wrongFormatTests = [
  { property: 'login', value: 2, constraint: 'isString' },
  { property: 'password', value: 2, constraint: 'isString' },
];

describe('Signup DTO', () => {
  it('should not set default values', () => {
    const dto = new SignupDto();

    expect(dto).toMatchObject({});
  });

  it.each(Object.keys(objWithRequiredFields))(
    "should fail of '%s' is missing",
    async (field) => {
      const dto = new SignupDto();

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
      const dto = new SignupDto();

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
