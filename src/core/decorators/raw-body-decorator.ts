import { createParamDecorator } from '@nestjs/common';

export const RawBody = createParamDecorator(
  (_, ctx) => ctx.switchToHttp().getRequest().body,
);
