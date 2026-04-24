// all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { AppError } from './app-errors';
import { StatusCodes } from 'http-status-codes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_ERROR');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const isAppError = exception instanceof AppError;

    const status = exception.getStatus
      ? exception.getStatus()
      : StatusCodes.INTERNAL_SERVER_ERROR;

    const logPayload = {
      status,
      description: isAppError ? exception.description : exception.message,
      errorDetail: isAppError
        ? exception.logContext
        : 'An unexpected error occurred',
    };
    const message = 'Exception:';

    if (status >= 500) {
      this.logger.error(logPayload, message, exception.stack);
    } else if (status >= 400) {
      this.logger.warn(logPayload, message);
    } else {
      this.logger.log(logPayload, message);
    }

    response.status(status).json(exception.getResponse());
  }
}
