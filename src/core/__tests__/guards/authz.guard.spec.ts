import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { AuthzGuard } from 'src/core/guards/authz.guard';
import { Reflector, ModuleRef } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ForbiddenError } from 'src/core/exceptions/app-errors';

describe('Authz Guard', () => {
  let guard: AuthzGuard;
  let reflector: Reflector;
  let moduleRef: ModuleRef;

  const mockResourceService = {
    getOne: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthzGuard,
        {
          provide: Reflector,
          useValue: { getAllAndOverride: vi.fn() },
        },
        {
          provide: ModuleRef,
          useValue: { get: vi.fn() },
        },
      ],
    }).compile();

    guard = module.get<AuthzGuard>(AuthzGuard);
    reflector = module.get<Reflector>(Reflector);
    moduleRef = module.get<ModuleRef>(ModuleRef);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockContext = (request: any): ExecutionContext =>
    ({
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('allows access if no authz options defined', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);
    const context = createMockContext({});

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('throws ForbiddenError if roles do not match', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue([
      { roles: [UserRole.admin] },
    ]);
    const context = createMockContext({
      user: { role: UserRole.editor, id: '1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenError);
  });

  it('validates ownership via params constraints', async () => {
    const authOptions = [
      {
        roles: [UserRole.editor],
        constraints: {
          service: 'SomeService',
          paramName: 'id',
          propertyName: 'authorId',
        },
      },
    ];

    vi.mocked(reflector.getAllAndOverride).mockReturnValue(authOptions);
    vi.mocked(moduleRef.get).mockReturnValue(mockResourceService);

    const request = {
      user: { role: UserRole.editor, id: 'user-123' },
      params: { id: 'resource-456' },
    };

    mockResourceService.getOne.mockResolvedValue({
      id: 'resource-456',
      authorId: 'user-123',
    });

    const result = await guard.canActivate(createMockContext(request));

    expect(result).toBe(true);
    expect(moduleRef.get).toHaveBeenCalledWith('SomeService', {
      strict: false,
    });
    expect(mockResourceService.getOne).toHaveBeenCalledWith({
      id: 'resource-456',
    });
  });

  it('should validate ownership via body constraints', async () => {
    const authOptions = [
      {
        roles: [UserRole.editor],
        constraints: { bodyPropertyName: 'authorId' },
      },
    ];

    vi.mocked(reflector.getAllAndOverride).mockReturnValue(authOptions);

    const request = {
      user: { role: UserRole.editor, id: 'user-123' },
      body: { authorId: 'user-123' },
    };

    const result = await guard.canActivate(createMockContext(request));
    expect(result).toBe(true);
  });

  it('throws ForbiddenError if ownership check fails', async () => {
    const authOptions = [
      {
        roles: [UserRole.editor],
        constraints: { bodyPropertyName: 'authorId' },
      },
    ];

    vi.mocked(reflector.getAllAndOverride).mockReturnValue(authOptions);

    const request = {
      user: { role: UserRole.editor, id: 'user-123' },
      body: { authorId: 'different-user' },
    };

    await expect(guard.canActivate(createMockContext(request))).rejects.toThrow(
      ForbiddenError,
    );
  });
});
