import { IS_PUBLIC_KEY } from './../../decorators/public-route.decorator';
import { Test, TestingModule } from '@nestjs/testing';
import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

const createMockContext = (authHeader?: string) =>
  ({
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: authHeader },
      }),
    }),
  }) as unknown as ExecutionContext;

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const mockJwtService = { verifyAsync: vi.fn() };
  const mockReflector = { getAllAndOverride: vi.fn() };
  const mockUserService = { getOne: vi.fn() };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('JWT_SECRET_KEY', 'test_secret');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('should return true if route is public', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      expect.any(Array),
    );
  });

  it('should throw UnauthorizedException if no token', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer invalid-token');

    mockJwtService.verifyAsync.mockRejectedValue(new Error());

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if had error finding user', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer invalid-token');

    const payload = { userId: '1', version: 2 };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    mockUserService.getOne.mockRejectedValue(new Error());

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException if no user found', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer invalid-token');

    const payload = { userId: '1', version: 2 };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    mockUserService.getOne.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw ForbiddenException if user version mismatch', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext('Bearer valid-token');

    const payload = { userId: '1', version: 2 };
    const user = { id: '1', tokenVersion: 1 };

    mockJwtService.verifyAsync.mockResolvedValue(payload);
    mockUserService.getOne.mockResolvedValue(user);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return true and set user if everything is valid', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    const request = { headers: { authorization: 'Bearer token' }, user: null };
    const context = {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    const user = { id: '1', tokenVersion: 1 };
    mockJwtService.verifyAsync.mockResolvedValue({ userId: '1', version: 1 });
    mockUserService.getOne.mockResolvedValue(user);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(user);
  });
});
