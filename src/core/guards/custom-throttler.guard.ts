import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TooManyRequestsError } from '../exceptions/app-errors';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();

    throw new TooManyRequestsError(
      {
        service: CustomThrottlerGuard.name,
        ip: request.ip,
      },
      'You have exceeded the allowed number of requests. Please try again later.',
    );
  }
}
