import { Reflector } from '@nestjs/core';
import { Type } from '@nestjs/common';

export interface ResponseMapper<
  T = Record<string, any>,
  R = Record<string, any>,
> {
  map(data: T): R;
}

export const UseResponseMapper =
  Reflector.createDecorator<Type<ResponseMapper>>();
