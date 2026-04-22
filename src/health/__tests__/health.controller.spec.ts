import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { RequestMethod } from '@nestjs/common';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public-route.decorator';

describe('Health Controller', () => {
  let controller: HealthController;

  const mockService = {
    check: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should have the correct base path', () => {
    const path = Reflect.getMetadata(PATH_METADATA, HealthController);

    expect(path).toBe('health');
  });

  it('should be GET /', () => {
    const method = Reflect.getMetadata(METHOD_METADATA, controller.check);
    const path = Reflect.getMetadata(PATH_METADATA, controller.check);

    expect(method).toBe(RequestMethod.GET);
    expect(path).toBe('/');
  });

  it('should be public route', () => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.check);

    expect(isPublic).toBeTruthy();
  });

  it('returns correct data', async () => {
    mockService.check.mockResolvedValue({ status: 'ok' });

    const result = await controller.check();

    expect(result).toEqual({ status: 'ok' });
  });
});
