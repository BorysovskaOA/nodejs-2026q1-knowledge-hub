import { HttpException } from '@nestjs/common';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';

export class AppError extends HttpException {
  constructor(
    public readonly logContext: any,
    public readonly statusCode: StatusCodes,
    public readonly description?: string,
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
  ) {
    super(logContext, StatusCodes.BAD_REQUEST, description);
  }
}

export class NotFoundError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
  ) {
    super(logContext, StatusCodes.NOT_FOUND, description);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
  ) {
    super(logContext, StatusCodes.UNPROCESSABLE_ENTITY, description);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description: any,
  ) {
    super(logContext, StatusCodes.UNAUTHORIZED, description);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description?: any,
  ) {
    super(logContext, StatusCodes.FORBIDDEN, description);
  }
}

export class ConflictError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description?: any,
  ) {
    super(logContext, StatusCodes.CONFLICT, description);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    public readonly logContext: any,
    public readonly description?: any,
  ) {
    super(logContext, StatusCodes.TOO_MANY_REQUESTS, description);
  }
}
