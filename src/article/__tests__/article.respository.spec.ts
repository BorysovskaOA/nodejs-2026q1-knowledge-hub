import { SortOrder } from './../../core/dtos/sorting.dto';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { TestingModule, Test } from '@nestjs/testing';
import { ArticleRepository, ArticleWithTags } from '../article.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ArticleEntity } from '../models/article.entity';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { Prisma } from '@prisma/client';

const articleFromDb: ArticleWithTags = {
  id: 'id',
  title: 'Article title',
  content: 'Article content',
  status: 'draft',
  authorId: 'authorId',
  categoryId: 'categoryId',
  tags: [{ id: 'tagId', name: 'tag' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const formattedArticle = new ArticleEntity({
  ...articleFromDb,
  tags: articleFromDb.tags.map((t) => t.name),
});

describe('Article Repository', () => {
  let repository: ArticleRepository;

  const mockPrisma = {
    article: {
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
        ArticleRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<ArticleRepository>(ArticleRepository);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockPrisma.article.findMany.mockResolvedValue([articleFromDb]);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAll({});

      expect(mockPrisma.article.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: { tags: true } }),
      );
      expect(result[0]).toBeInstanceOf(ArticleEntity);
      expect(result[0]).toMatchObject(formattedArticle);
    });

    it('should be called with filters', async () => {
      const status = 'draft';
      const categoryId = articleFromDb.categoryId as string;
      const tag = articleFromDb.tags[0].name;

      await repository.findAll({ status, categoryId, tag });

      expect(mockPrisma.article.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status,
            categoryId,
            tags: { some: { name: tag } },
          },
        }),
      );
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: { findMany: vi.fn().mockResolvedValue([]) },
      } as unknown as Prisma.TransactionClient;

      await repository.findAll({}, mockTx);

      expect(mockPrisma.article.findMany).not.toHaveBeenCalled();
      expect(mockTx.article.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAllPaginated', () => {
    const paginationParams = {
      page: 3,
      limit: 20,
      sortKey: 'title',
      sortOrder: SortOrder.ASC,
    };

    beforeEach(() => {
      mockPrisma.article.findMany.mockResolvedValue([articleFromDb]);
      mockPrisma.article.count.mockResolvedValue(5);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAllPaginated(paginationParams as any);

      expect(mockPrisma.article.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { tags: true },
          take: paginationParams.limit,
          skip: (paginationParams.page - 1) * paginationParams.limit,
          orderBy: { [paginationParams.sortKey]: paginationParams.sortOrder },
        }),
      );
      expect(mockPrisma.article.count).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toMatchObject(formattedArticle);
      expect(result.page).toEqual(paginationParams.page);
      expect(result.limit).toBe(paginationParams.limit);
      expect(result.total).toEqual(5);
    });

    it('should be called with filters', async () => {
      const status = 'draft';
      const categoryId = articleFromDb.categoryId as string;
      const tag = articleFromDb.tags[0].name;

      await repository.findAllPaginated({
        status,
        categoryId,
        tag,
        ...(paginationParams as any),
      });

      const whereFilter = { status, categoryId, tags: { some: { name: tag } } };

      expect(mockPrisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: whereFilter,
        }),
      );
      expect(mockPrisma.article.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: whereFilter,
        }),
      );
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: {
          findMany: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        },
      } as unknown as Prisma.TransactionClient;

      await repository.findAllPaginated(paginationParams as any, mockTx);

      expect(mockPrisma.article.findMany).not.toHaveBeenCalled();
      expect(mockTx.article.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.count).not.toHaveBeenCalled();
      expect(mockTx.article.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockPrisma.article.findUnique.mockResolvedValue(articleFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findById('id');

      expect(mockPrisma.article.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ include: { tags: true } }),
      );
      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(formattedArticle);
    });

    it('returns null if not found', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      const result = await repository.findById('id');

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: { findUnique: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findById('id', mockTx);

      expect(mockPrisma.article.findUnique).not.toHaveBeenCalled();
      expect(mockTx.article.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const filter = { authorId: articleFromDb.authorId as string };
    beforeEach(() => {
      mockPrisma.article.findFirst.mockResolvedValue(articleFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findOne(filter);

      expect(mockPrisma.article.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ include: { tags: true } }),
      );
      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(formattedArticle);
    });

    it('returns null if not found', async () => {
      mockPrisma.article.findFirst.mockResolvedValue(null);
      const result = await repository.findOne(filter);

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: { findFirst: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findOne(filter, mockTx);

      expect(mockPrisma.article.findFirst).not.toHaveBeenCalled();
      expect(mockTx.article.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const createData = {
      title: articleFromDb.title,
      content: articleFromDb.content,
      status: articleFromDb.status,
      tags: articleFromDb.tags.map((t) => t.name),
      authorId: articleFromDb.authorId,
      categoryId: articleFromDb.categoryId,
    };
    beforeEach(() => {
      vi.clearAllMocks();
      mockPrisma.article.create.mockResolvedValue(articleFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.create(createData);

      expect(mockPrisma.article.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: { connectOrCreate: expect.any(Array) },
          }),
          include: { tags: true },
        }),
      );
      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(formattedArticle);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: { create: vi.fn().mockResolvedValue(articleFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.create(createData, mockTx);

      expect(mockPrisma.article.create).not.toHaveBeenCalled();
      expect(mockTx.article.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateData = { title: 'title' };
    beforeEach(() => {
      mockPrisma.article.update.mockResolvedValue(articleFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.update('id', updateData);

      expect(mockPrisma.article.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: undefined,
          }),
          include: { tags: true },
        }),
      );
      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(formattedArticle);
    });

    it('should update tags', async () => {
      await repository.update('id', { tags: ['tag'] });

      expect(mockPrisma.article.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: {
              set: [],
              connectOrCreate: expect.any(Array),
            },
          }),
        }),
      );
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: { update: vi.fn().mockResolvedValue(articleFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.update('id', updateData, mockTx);

      expect(mockPrisma.article.update).not.toHaveBeenCalled();
      expect(mockTx.article.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockPrisma.article.delete.mockResolvedValue(articleFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.delete('id');

      expect(mockPrisma.article.delete).toHaveBeenCalledTimes(1);
      expect(mockPrisma.article.delete).toHaveBeenCalledWith(
        expect.objectContaining({ include: { tags: true } }),
      );
      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(formattedArticle);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        article: { delete: vi.fn().mockResolvedValue(articleFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.delete('id', mockTx);

      expect(mockPrisma.article.delete).not.toHaveBeenCalled();
      expect(mockTx.article.delete).toHaveBeenCalledTimes(1);
    });
  });
});
