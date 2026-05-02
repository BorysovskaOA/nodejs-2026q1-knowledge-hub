import { HttpException } from '@nestjs/common';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export class AppError extends HttpException {
  constructor(
    public readonly statusCode: StatusCodes,
    public readonly description: any,
    public readonly logContext: any,
    public readonly headers?: Record<string, any>,
  ) {
    const responseBody = {
      statusCode,
      message: getReasonPhrase(statusCode),
      description,
    };
    super(responseBody, statusCode);
  }
}

export class BadRequestError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.BAD_REQUEST, description, logContext, headers);
  }
}

export class NotFoundError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.NOT_FOUND, description, logContext, headers);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, description, logContext, headers);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.UNAUTHORIZED, description, logContext, headers);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.FORBIDDEN, description, logContext, headers);
  }
}

export class ConflictError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.CONFLICT, description, logContext, headers);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    public readonly description: any,
    public readonly logContext: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.TOO_MANY_REQUESTS, description, logContext, headers);
  }
}

export class InternalServerError extends AppError {
  constructor(
    public readonly description: any,
    public readonly logContext: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, description, logContext, headers);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    public readonly description: any,
    public readonly logContext: any,
    public readonly headers?: Record<string, any>,
  ) {
    super(StatusCodes.SERVICE_UNAVAILABLE, description, logContext, headers);
  }
}
