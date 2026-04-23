import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CommentEntity } from '../models/comment.entity';
import { CommentService } from '../comment.service';
import { ArticleService } from 'src/article/article.service';
import { CommentRepository } from '../comment.repository';

const comment = new CommentEntity({
  id: 'id',
  content: 'Comment title',
  authorId: 'authorId',
  articleId: 'articleId',
  createdAt: new Date(),
});

describe('Comment Service', () => {
  let service: CommentService;

  const mockRepository = {
    findAll: vi.fn(),
    findAllPaginated: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockArticleService = {
    validateArticleExistWithException: vi.fn(),
  };

  const mockUserService = {
    validateUserExistWithException: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: CommentRepository,
          useValue: mockRepository,
        },
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    mockArticleService.validateArticleExistWithException.mockResolvedValue(
      undefined,
    );
    mockUserService.validateUserExistWithException.mockResolvedValue(undefined);
  });

  describe('create', () => {
    const createData = {
      content: 'Content',
      authorId: 'authorId',
      articleId: 'articleId',
    };

    beforeEach(() => {
      mockRepository.create.mockResolvedValue(comment);
    });

    it('returns data correctly', async () => {
      const result = await service.create(createData);

      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(comment);
    });

    it('should check for valid articleId', async () => {
      await service.create(createData);

      expect(
        mockArticleService.validateArticleExistWithException,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockArticleService.validateArticleExistWithException,
      ).toHaveBeenCalledWith(createData.articleId, 'articleId');
    });

    it('throws BadRequestException if invalid authorId', async () => {
      mockArticleService.validateArticleExistWithException.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(service.create(createData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should check for valid authorId', async () => {
      await service.create(createData);

      expect(
        mockUserService.validateUserExistWithException,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockUserService.validateUserExistWithException,
      ).toHaveBeenCalledWith(createData.authorId);
    });

    it('throws BadRequestException if invalid authorId', async () => {
      mockUserService.validateUserExistWithException.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(service.create(createData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([comment]);
    });

    it('returns data correctly', async () => {
      const filter = {
        articleId: 'articleId',
      };
      const result = await service.getAll(filter);

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(CommentEntity);
      expect(result[0]).toMatchObject(comment);
    });
  });

  describe('getAllPaginated', () => {
    const paginationParams = {
      page: 3,
      limit: 20,
      sortKey: 'status',
      sortOrder: SortOrder.ASC,
    };

    beforeEach(() => {
      mockRepository.findAllPaginated.mockResolvedValue(
        new PaginatedResponseDto(
          [comment],
          1,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    });

    it('returns data correctly', async () => {
      const filter = {
        articleId: 'articleId',
        ...(paginationParams as any),
      };
      const result = await service.getAllPaginated(filter);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data[0]).toBeInstanceOf(CommentEntity);
      expect(result.data[0]).toMatchObject(comment);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(comment);
    });

    it('returns data correctly', async () => {
      const result = await service.getById('id');

      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(comment);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOne', () => {
    const filter = { authorId: 'authorId' };
    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(comment);
    });

    it('returns data correctly', async () => {
      const result = await service.getOne(filter);

      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(comment);
    });

    it('returns null if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getOne(filter);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = { content: 'Content' };

    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(comment);
      mockRepository.update.mockResolvedValue(comment);
    });

    it('returns data correctly', async () => {
      const result = await service.update('id', updateData);

      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(comment);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('id', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(comment);
      mockRepository.delete.mockResolvedValue(comment);
    });

    it('returns data correctly', async () => {
      const result = await service.delete('id');

      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toMatchObject(comment);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('id')).rejects.toThrow(NotFoundException);
    });
  });
});
