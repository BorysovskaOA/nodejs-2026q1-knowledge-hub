import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { UseResponseMapper } from '../decorators/use-response-mapper.decorator';

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

        if (Array.isArray(data)) {
          return data.map(transform);
        }

        // For paginated response
        if ('data' in data && Array.isArray(data.data)) {
          return {
            ...data,
            data: data.data.map(transform),
          };
        }

        return transform(data);
      }),
    );
  }
}
