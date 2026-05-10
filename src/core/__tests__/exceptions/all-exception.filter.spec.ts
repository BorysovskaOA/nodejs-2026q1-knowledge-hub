import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, Logger } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CustomExceptionFilter } from 'src/core/exceptions/custom-exception.filter';
import { NotFoundError } from 'src/core/exceptions/app-errors';
import { StatusCodes } from 'http-status-codes';

describe('Exception Filter', () => {
  let filter: CustomExceptionFilter;

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };

  const mockArgumentsHost = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
      getRequest: () => ({ url: '/test' }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomExceptionFilter],
    }).compile();
    filter = module.get<CustomExceptionFilter>(CustomExceptionFilter);

    vi.clearAllMocks();
  });

  it('should log 500 error as "error" level and return error', () => {
    const error = new Error('System Crash');
    const spy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        description: 'System Crash',
        errorDetail: 'An unexpected error occurred',
      }),
      'Exception:',
      error.stack,
    );
  });

  it('should log AppError as "warn" and use custom description and context', () => {
    const spy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    const appError = new NotFoundError('Service', 'Not found');

    filter.catch(appError, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        description: 'Not found',
        errorDetail: 'Service',
      }),
      'Exception:',
    );
  });

  it('should log using "log" level for status codes below 400', () => {
    const spy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const customError = {
      getStatus: () => 304,
      message: 'Redirected',
      getResponse: () => ({ message: 'Redirected' }),
    };

    filter.catch(customError, mockArgumentsHost);

    expect(spy).toHaveBeenCalled();
  });
});
