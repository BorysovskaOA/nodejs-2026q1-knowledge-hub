import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { UseResponseMapper } from './useResponseMapper.decorator';

@Injectable()
export class GlobalResponseTransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const Mapper = this.reflector.get(UseResponseMapper, context.getHandler());

    return next.handle().pipe(
      map((data) => {
        if (!data || !Mapper) return data;

        const mapper = new Mapper();

        const transform = (item: any) => {
          return mapper.map(item);
        };

        return Array.isArray(data) ? data.map(transform) : transform(data);
      }),
    );
  }
}
