import { ArticleWorkflow } from './../utils/article-workflow.util';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleStatus } from '@prisma/client';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ArticleEntity } from '../models/article.entity';
import { ArticleService } from '../article.service';
import { ArticleRepository } from '../article.repository';
import { CategoryService } from 'src/category/categoty.service';
import { UserService } from 'src/user/user.service';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

vi.mock('./../utils/article-workflow.util', () => ({
  ArticleWorkflow: {
    canTransition: vi.fn(),
  },
}));

const article = new ArticleEntity({
  id: 'id',
  title: 'Article title',
  content: 'Article content',
  status: ArticleStatus.draft,
  authorId: 'authorId',
  categoryId: 'categoryId',
  tags: ['tag'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Article Service', () => {
  let service: ArticleService;

  const mockRepository = {
    findAll: vi.fn(),
    findAllPaginated: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockCategoryService = {
    validateCategoryExistWithException: vi.fn(),
  };

  const mockUserService = {
    validateUserExistWithException: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleRepository,
          useValue: mockRepository,
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    mockCategoryService.validateCategoryExistWithException.mockResolvedValue(
      undefined,
    );
    mockUserService.validateUserExistWithException.mockResolvedValue(undefined);
    vi.mocked(ArticleWorkflow).canTransition.mockImplementation(() => true);
  });

  describe('create', () => {
    const createData = {
      title: 'Article title',
      content: 'Article content',
      status: ArticleStatus.draft,
      authorId: 'authorId',
      categoryId: 'categoryId',
      tags: ['tag'],
    };

    beforeEach(() => {
      mockRepository.create.mockResolvedValue(article);
    });

    it('returns data correctly', async () => {
      const result = await service.create(createData);

      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(article);
    });

    it('should check for valid categoryId', async () => {
      await service.create(createData);

      expect(
        mockCategoryService.validateCategoryExistWithException,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCategoryService.validateCategoryExistWithException,
      ).toHaveBeenCalledWith(createData.categoryId);
    });

    it('throws BadRequestException if invalid categoryId', async () => {
      mockCategoryService.validateCategoryExistWithException.mockRejectedValue(
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
      mockRepository.findAll.mockResolvedValue([article]);
    });

    it('returns data correctly', async () => {
      const result = await service.getAll({});

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(ArticleEntity);
      expect(result[0]).toMatchObject(article);
    });

    it('applies filters', async () => {
      const filter = {
        status: ArticleStatus.published,
        categoryId: 'categoryId',
        tag: 'tag',
      };

      await service.getAll(filter);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
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
          [article],
          1,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    });

    it('returns data correctly', async () => {
      const result = await service.getAllPaginated(paginationParams as any);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data[0]).toBeInstanceOf(ArticleEntity);
      expect(result.data[0]).toMatchObject(article);
    });

    it('applies filters', async () => {
      const filter = {
        status: ArticleStatus.published,
        categoryId: 'categoryId',
        tag: 'tag',
        ...paginationParams,
      };

      await service.getAll(filter);

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(article);
    });

    it('returns data correctly', async () => {
      const result = await service.getById('id');

      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(article);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOne', () => {
    const filter = { authorId: 'authorId' };
    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(article);
    });

    it('returns data correctly', async () => {
      const result = await service.getOne(filter);

      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(article);
    });

    it('returns null if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getOne(filter);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = { status: ArticleStatus.published };

    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(article);
      mockRepository.update.mockResolvedValue(article);
    });

    it('returns data correctly', async () => {
      const result = await service.update('id', updateData);

      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(article);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('id', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check for valid categoryId', async () => {
      await service.update('id', { categoryId: 'categoryId' });

      expect(
        mockCategoryService.validateCategoryExistWithException,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockCategoryService.validateCategoryExistWithException,
      ).toHaveBeenCalledWith('categoryId');
    });

    it('throws BadRequestException if invalid categoryId', async () => {
      mockCategoryService.validateCategoryExistWithException.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(
        service.update('id', { categoryId: 'categoryId' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException if cannot transition', async () => {
      vi.mocked(ArticleWorkflow.canTransition).mockImplementation(() => false);

      try {
        await service.update('id', { status: ArticleStatus.archived });
      } catch (err) {
        expect(err).toBeInstanceOf(ConflictException);
        const response = err.getResponse();

        expect(response).toEqual({
          statusCode: StatusCodes.CONFLICT,
          error: getReasonPhrase(StatusCodes.CONFLICT),
          message: [{ field: 'status', errors: [expect.any(String)] }],
        });
      }
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(article);
      mockRepository.delete.mockResolvedValue(article);
    });

    it('returns data correctly', async () => {
      const result = await service.delete('id');

      expect(result).toBeInstanceOf(ArticleEntity);
      expect(result).toMatchObject(article);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateArticleExist', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(article);
    });

    it('returns true if exist', async () => {
      const result = await service.validateArticleExist('id');

      expect(result).toBeTruthy();
    });

    it('returns false if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      const result = await service.validateArticleExist('id');

      expect(result).toBeFalsy();
    });
  });

  describe('validateArticleExistWithException', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(article);
    });

    it('should not return anything if exist', async () => {
      const result = await service.validateArticleExistWithException('id');

      expect(result).toBeUndefined();
    });

    it('throws UnprocessableEntityException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      try {
        await service.validateArticleExistWithException('id');
      } catch (err) {
        expect(err).toBeInstanceOf(UnprocessableEntityException);
        const response = err.getResponse();

        expect(response).toEqual({
          statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
          error: getReasonPhrase(StatusCodes.UNPROCESSABLE_ENTITY),
          message: [{ field: 'articleId', errors: [expect.any(String)] }],
        });
      }
    });
  });
});
