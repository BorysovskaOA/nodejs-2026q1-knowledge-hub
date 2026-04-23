import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoggerMiddleware } from 'src/core/middlewares/logger.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Logger Middleware', () => {
  let middleware: LoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = vi.fn();

  beforeEach(() => {
    middleware = new LoggerMiddleware();

    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
    };

    mockResponse = {
      statusCode: 200,
      on: vi.fn((event, callback) => {
        if (event === 'finish') {
          (mockResponse as any).finishCallback = callback;
        }
        return mockResponse;
      }),
    } as any;

    vi.clearAllMocks();
  });

  it('should call next() and register finish event listener', () => {
    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.on).toHaveBeenCalledWith(
      'finish',
      expect.any(Function),
    );
  });

  it('should log information when response finishes', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    middleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    const finishCallback = (mockResponse as any).finishCallback;
    finishCallback();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /test 200'),
    );

    consoleSpy.mockRestore();
  });
});
