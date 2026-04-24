import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TooManyRequestsError } from '../exceptions/app-errors';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger('THROTTLER');

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
