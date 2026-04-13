import { createParamDecorator } from '@nestjs/common';

export const RawBody = createParamDecorator(
  (data, ctx) => ctx.switchToHttp().getRequest().body,
);
