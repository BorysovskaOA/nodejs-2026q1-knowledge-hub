import { SortOrder } from './../../core/dtos/sorting.dto';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from '../user.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from '../models/user.entity';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { Prisma, User } from '@prisma/client';

const userFromDb: User = {
  id: 'id',
  login: 'login',
  passwordHash: 'passwordHash',
  tokenVersion: 1,
  role: 'viewer',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const formattedUser = new UserEntity(userFromDb);

describe('User Repository', () => {
  let repository: UserRepository;

  const mockPrisma = {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockPrisma.user.findMany.mockResolvedValue([userFromDb]);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[0]).toMatchObject(formattedUser);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: { findMany: vi.fn().mockResolvedValue([]) },
      } as unknown as Prisma.TransactionClient;

      await repository.findAll(mockTx);

      expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
      expect(mockTx.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllPaginated', () => {
    const paginationParams = {
      page: 3,
      limit: 20,
      sortKey: 'createdAt',
      sortOrder: SortOrder.ASC,
    };

    beforeEach(() => {
      mockPrisma.user.findMany.mockResolvedValue([userFromDb]);
      mockPrisma.user.count.mockResolvedValue(5);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAllPaginated(paginationParams as any);

      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: paginationParams.limit,
          skip: (paginationParams.page - 1) * paginationParams.limit,
          orderBy: { [paginationParams.sortKey]: paginationParams.sortOrder },
        }),
      );
      expect(mockPrisma.user.count).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toMatchObject(formattedUser);
      expect(result.page).toEqual(paginationParams.page);
      expect(result.limit).toBe(paginationParams.limit);
      expect(result.total).toEqual(5);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: {
          findMany: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        },
      } as unknown as Prisma.TransactionClient;

      await repository.findAllPaginated(paginationParams as any, mockTx);

      expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
      expect(mockTx.user.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.count).not.toHaveBeenCalled();
      expect(mockTx.user.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(userFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findById('id');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(formattedUser);
    });

    it('returns null if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await repository.findById('id');

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: { findUnique: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findById('id', mockTx);

      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      expect(mockTx.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const filter = { login: userFromDb.login as string };
    beforeEach(() => {
      mockPrisma.user.findFirst.mockResolvedValue(userFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findOne(filter);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(formattedUser);
    });

    it('returns null if not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      const result = await repository.findOne(filter);

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: { findFirst: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findOne(filter, mockTx);

      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
      expect(mockTx.user.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const createData = {
      login: userFromDb.login,
      passwordHash: userFromDb.passwordHash,
      role: userFromDb.role,
    };
    beforeEach(() => {
      mockPrisma.user.create.mockResolvedValue(userFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.create(createData);

      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(formattedUser);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: { create: vi.fn().mockResolvedValue(userFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.create(createData, mockTx);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateData = { passwordHash: 'newPassword' };
    beforeEach(() => {
      mockPrisma.user.update.mockResolvedValue(userFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.update('id', updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(formattedUser);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: { update: vi.fn().mockResolvedValue(userFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.update('id', updateData, mockTx);

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockTx.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockPrisma.user.delete.mockResolvedValue(userFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.delete('id');

      expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(formattedUser);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        user: { delete: vi.fn().mockResolvedValue(userFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.delete('id', mockTx);

      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
      expect(mockTx.user.delete).toHaveBeenCalledTimes(1);
    });
  });
});
