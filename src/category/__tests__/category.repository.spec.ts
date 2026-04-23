import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { TestingModule, Test } from '@nestjs/testing';
import { CategoryRepository } from '../category.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryEntity } from '../models/category.entity';
import { Category, Prisma } from '@prisma/client';
import { SortOrder } from 'src/core/dtos/sorting.dto';

const categoryFromDb: Category = {
  id: 'id',
  name: 'Category name',
  description: 'Category description',
};

const formattedCategory = new CategoryEntity(categoryFromDb);

describe('Category Repository', () => {
  let repository: CategoryRepository;

  const mockPrisma = {
    category: {
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
        CategoryRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<CategoryRepository>(CategoryRepository);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockPrisma.category.findMany.mockResolvedValue([categoryFromDb]);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAll();

      expect(mockPrisma.category.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: SortOrder.ASC },
        }),
      );
      expect(result[0]).toBeInstanceOf(CategoryEntity);
      expect(result[0]).toMatchObject(formattedCategory);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        category: { findMany: vi.fn().mockResolvedValue([]) },
      } as unknown as Prisma.TransactionClient;

      await repository.findAll(mockTx);

      expect(mockPrisma.category.findMany).not.toHaveBeenCalled();
      expect(mockTx.category.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockPrisma.category.findUnique.mockResolvedValue(categoryFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findById('id');

      expect(mockPrisma.category.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(formattedCategory);
    });

    it('returns null if not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      const result = await repository.findById('id');

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        category: { findUnique: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findById('id', mockTx);

      expect(mockPrisma.category.findUnique).not.toHaveBeenCalled();
      expect(mockTx.category.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const filter = { name: 'name' };
    beforeEach(() => {
      mockPrisma.category.findFirst.mockResolvedValue(categoryFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findOne(filter);

      expect(mockPrisma.category.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(formattedCategory);
    });

    it('returns null if not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);
      const result = await repository.findOne(filter);

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        category: { findFirst: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findOne(filter, mockTx);

      expect(mockPrisma.category.findFirst).not.toHaveBeenCalled();
      expect(mockTx.category.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const createData = {
      name: categoryFromDb.name,
      description: categoryFromDb.description,
    };
    beforeEach(() => {
      mockPrisma.category.create.mockResolvedValue(categoryFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.create(createData);

      expect(mockPrisma.category.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(formattedCategory);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        category: { create: vi.fn().mockResolvedValue(categoryFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.create(createData, mockTx);

      expect(mockPrisma.category.create).not.toHaveBeenCalled();
      expect(mockTx.category.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateData = { name: 'name' };
    beforeEach(() => {
      mockPrisma.category.update.mockResolvedValue(categoryFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.update('id', updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(formattedCategory);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        category: { update: vi.fn().mockResolvedValue(categoryFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.update('id', updateData, mockTx);

      expect(mockPrisma.category.update).not.toHaveBeenCalled();
      expect(mockTx.category.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockPrisma.category.delete.mockResolvedValue(categoryFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.delete('id');

      expect(mockPrisma.category.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(formattedCategory);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        category: { delete: vi.fn().mockResolvedValue(categoryFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.delete('id', mockTx);

      expect(mockPrisma.category.delete).not.toHaveBeenCalled();
      expect(mockTx.category.delete).toHaveBeenCalledTimes(1);
    });
  });
});
