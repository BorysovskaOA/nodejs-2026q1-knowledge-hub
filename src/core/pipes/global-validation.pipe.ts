import {
  Injectable,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { BadRequestError } from '../exceptions/app-errors';

@Injectable()
export class GlobalValidationPipe extends ValidationPipe {
  constructor(overrides?: ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((acc, err) => {
          return {
            ...acc,
            [err.property]: Object.values(err.constraints || {}),
          };
        }, {});
        return new BadRequestError(GlobalValidationPipe.name, formattedErrors);
      },
      ...overrides,
    });
  }
}
