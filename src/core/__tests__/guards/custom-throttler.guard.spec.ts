import { TooManyRequestsError } from './../../exceptions/app-errors';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import { describe, it, expect, beforeEach } from 'vitest';
import { CustomThrottlerGuard } from 'src/core/guards/custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  const mockRequest = {
    ip: '127.0.0.1',
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomThrottlerGuard,
        {
          provide: 'THROTTLER:MODULE_OPTIONS',
          useValue: [{ ttl: 60, limit: 10 }],
        },
        {
          provide: ThrottlerStorage,
          useValue: {},
        },
      ],
    }).compile();

    guard = module.get<CustomThrottlerGuard>(CustomThrottlerGuard);
  });

  it('should throw TooManyRequestsError with correct payload', async () => {
    try {
      await (guard as any).throwThrottlingException(mockExecutionContext);
    } catch (error) {
      expect(error).toBeInstanceOf(TooManyRequestsError);
      expect(error.logContext).toMatchObject({
        service: 'CustomThrottlerGuard',
        ip: '127.0.0.1',
      });
    }
  });
});
