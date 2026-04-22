import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  UnauthorizedException,
  Type,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UnauthorizedValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!value) throw new UnauthorizedException();

    if (!metatype || !this.canValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);

    if (typeof object !== 'object' || object === null)
      throw new UnauthorizedException();

    const errors = await validate(object);

    if (errors.length > 0) throw new UnauthorizedException();

    return value;
  }

  private canValidate(metatype: Type<unknown>): boolean {
    const types: Type<unknown>[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
