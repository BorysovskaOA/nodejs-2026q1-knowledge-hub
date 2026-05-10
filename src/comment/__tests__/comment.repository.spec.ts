import { SortOrder } from './../../core/dtos/sorting.dto';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { TestingModule, Test } from '@nestjs/testing';
import { CommentRepository } from '../comment.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentEntity } from '../models/comment.entity';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { Prisma } from '@prisma/client';

const commentFromDb = {
  id: 'id',
  content: 'Comment title',
  authorId: 'authorId',
  articleId: 'articleId',
  createdAt: new Date(),
};

const formattedComment = new CommentEntity(commentFromDb);

describe('Comment Repository', () => {
  let repository: CommentRepository;

  const mockPrisma = {
    comment: {
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
        CommentRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<CommentRepository>(CommentRepository);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockPrisma.comment.findMany.mockResolvedValue([commentFromDb]);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAll({});

      expect(mockPrisma.comment.findMany).toHaveBeenCalledTimes(1);
      expect(result[0]).toBeInstanceOf(CommentEntity);
      expect(result[0]).toMatchObject(formattedComment);
    });

    it('should be called with filters', async () => {
      const articleId = commentFromDb.articleId as string;
      await repository.findAll({ articleId });

      expect(mockPrisma.comment.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { articleId },
        }),
      );
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: { findMany: vi.fn().mockResolvedValue([]) },
      } as unknown as Prisma.TransactionClient;

      await repository.findAll({}, mockTx);

      expect(mockPrisma.comment.findMany).not.toHaveBeenCalled();
      expect(mockTx.comment.findMany).toHaveBeenCalledTimes(1);
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
      mockPrisma.comment.findMany.mockResolvedValue([commentFromDb]);
      mockPrisma.comment.count.mockResolvedValue(5);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findAllPaginated(paginationParams as any);

      expect(mockPrisma.comment.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: paginationParams.limit,
          skip: (paginationParams.page - 1) * paginationParams.limit,
          orderBy: { [paginationParams.sortKey]: paginationParams.sortOrder },
        }),
      );
      expect(mockPrisma.comment.count).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data[0]).toMatchObject(formattedComment);
      expect(result.page).toEqual(paginationParams.page);
      expect(result.limit).toBe(paginationParams.limit);
      expect(result.total).toEqual(5);
    });

    it('should be called with filters', async () => {
      const articleId = commentFromDb.articleId as string;

      await repository.findAllPaginated({
        articleId,
        ...(paginationParams as any),
      });

      const whereFilter = { articleId };

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: whereFilter,
        }),
      );
      expect(mockPrisma.comment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: whereFilter,
        }),
      );
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: {
          findMany: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
        },
      } as unknown as Prisma.TransactionClient;

      await repository.findAllPaginated(paginationParams as any, mockTx);

      expect(mockPrisma.comment.findMany).not.toHaveBeenCalled();
      expect(mockTx.comment.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.comment.count).not.toHaveBeenCalled();
      expect(mockTx.comment.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    beforeEach(() => {
      mockPrisma.comment.findUnique.mockResolvedValue(commentFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findById('id');

      expect(mockPrisma.comment.findUnique).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(formattedComment);
    });

    it('returns null if not found', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue(null);
      const result = await repository.findById('id');

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: { findUnique: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findById('id', mockTx);

      expect(mockPrisma.comment.findUnique).not.toHaveBeenCalled();
      expect(mockTx.comment.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const filter = { authorId: commentFromDb.authorId as string };
    beforeEach(() => {
      mockPrisma.comment.findFirst.mockResolvedValue(commentFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.findOne(filter);

      expect(mockPrisma.comment.findFirst).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(formattedComment);
    });

    it('returns null if not found', async () => {
      mockPrisma.comment.findFirst.mockResolvedValue(null);
      const result = await repository.findOne(filter);

      expect(result).toBeNull();
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: { findFirst: vi.fn().mockResolvedValue(null) },
      } as unknown as Prisma.TransactionClient;

      await repository.findOne(filter, mockTx);

      expect(mockPrisma.comment.findFirst).not.toHaveBeenCalled();
      expect(mockTx.comment.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    const createData = {
      content: commentFromDb.content,
      authorId: commentFromDb.authorId,
      articleId: commentFromDb.articleId,
    };
    beforeEach(() => {
      mockPrisma.comment.create.mockResolvedValue(commentFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.create(createData);

      expect(mockPrisma.comment.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(formattedComment);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: { create: vi.fn().mockResolvedValue(commentFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.create(createData, mockTx);

      expect(mockPrisma.comment.create).not.toHaveBeenCalled();
      expect(mockTx.comment.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const updateData = { content: 'content' };
    beforeEach(() => {
      mockPrisma.comment.update.mockResolvedValue(commentFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.update('id', updateData);

      expect(mockPrisma.comment.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(formattedComment);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: { update: vi.fn().mockResolvedValue(commentFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.update('id', updateData, mockTx);

      expect(mockPrisma.comment.update).not.toHaveBeenCalled();
      expect(mockTx.comment.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockPrisma.comment.delete.mockResolvedValue(commentFromDb);
    });

    it('returns data in correct format', async () => {
      const result = await repository.delete('id');

      expect(mockPrisma.comment.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(formattedComment);
    });

    it('should be called inside transaction', async () => {
      const mockTx = {
        comment: { delete: vi.fn().mockResolvedValue(commentFromDb) },
      } as unknown as Prisma.TransactionClient;

      await repository.delete('id', mockTx);

      expect(mockPrisma.comment.delete).not.toHaveBeenCalled();
      expect(mockTx.comment.delete).toHaveBeenCalledTimes(1);
    });
  });
});
