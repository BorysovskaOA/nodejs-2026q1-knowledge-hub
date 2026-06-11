import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { Pool } from 'pg';

const MOCK_DB_URL = 'postgresql://user:pass@localhost:5432/db'

vi.mock('pg', () => ({
  Pool: vi.fn().mockImplementation(function () {
    return {
      connect: vi.fn(),
      query: vi.fn(),
      end: vi.fn(),
    };
  }),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = vi.fn();
    $disconnect = vi.fn();
    $on = vi.fn();
  },
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{
        provide: PrismaService,
        useFactory: () => new PrismaService(MOCK_DB_URL)
      }],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should call $connect on onModuleInit', async () => {
    const connectSpy = vi.spyOn(service, '$connect');
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should register event listeners on onModuleInit', async () => {
    const onSpy = vi.spyOn(service, '$on');

    await service.onModuleInit();

    expect(onSpy).toHaveBeenCalledWith('query', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('warn', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('info', expect.any(Function));
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    const disconnectSpy = vi.spyOn(service, '$disconnect');
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should initialize Pool with DATABASE_URL', () => {
    expect(vi.mocked(Pool)).toHaveBeenCalledWith({
      connectionString: MOCK_DB_URL,
    });
  });
});
