import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TooManyRequestsError } from '../exceptions/app-errors';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();

    throw new TooManyRequestsError(
      `You have exceeded the allowed number of requests. Please retry ${throttlerLimitDetail.timeToExpire}s.`,
      {
        service: CustomThrottlerGuard.name,
        ip: request.ip,
        throttlerLimitDetail,
      },
      {
        'Retry-After': throttlerLimitDetail.timeToExpire,
        'X-RateLimit-Limit': throttlerLimitDetail.limit,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': throttlerLimitDetail.timeToBlockExpire,
      },
    );
  }
}
