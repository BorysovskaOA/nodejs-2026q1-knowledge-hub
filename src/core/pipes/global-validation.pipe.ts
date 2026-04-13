import {
  Injectable,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
        }));
        return new BadRequestException(formattedErrors);
      },
    });
  }
}
