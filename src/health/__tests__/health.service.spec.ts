import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { HealthService } from '../health.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Health Service', () => {
  let service: HealthService;
  let healthCheckService: HealthCheckService;
  let prismaIndicator: PrismaHealthIndicator;

  const mockHealthCheckService = {
    check: vi.fn(),
  };
  const mockPrismaIndicator = {
    pingCheck: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: PrismaHealthIndicator, useValue: mockPrismaIndicator },
        { provide: PrismaService, useValue: { $queryRaw: vi.fn() } },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    prismaIndicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call health.check with an array containing prisma ping check', async () => {
    mockHealthCheckService.check.mockResolvedValue({ status: 'ok' });

    await service.check();

    expect(healthCheckService.check).toHaveBeenCalledWith([
      expect.any(Function),
    ]);

    const checkFunctions = mockHealthCheckService.check.mock.calls[0][0];
    const prismaPingFn = checkFunctions[0];

    await prismaPingFn();

    expect(prismaIndicator.pingCheck).toHaveBeenCalledWith(
      'database',
      expect.anything(),
    );
  });
});
