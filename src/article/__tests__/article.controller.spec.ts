import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { ArticleController } from '../article.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from '../article.service';
import {
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { HttpStatus, RequestMethod } from '@nestjs/common';
import { AUTHZ_OPTIONS_KEY } from 'src/core/decorators/authorize.decorator';
import { ArticleStatus, UserRole } from '@prisma/client';
import { ArticleEntity } from '../models/article.entity';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import {
  ArticleListFiltersDto,
  ArticleListFiltersPaginatedDto,
} from '../models/article-list-filter.dto';
import { CreateArticleDto } from '../models/create-article.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { UpdateArticleDto } from '../models/update-article.dto';

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

describe('Article Controller', () => {
  let controller: ArticleController;

  const mockService = {
    getAll: vi.fn(),
    getAllPaginated: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should have the correct base path', () => {
    const path = Reflect.getMetadata(PATH_METADATA, ArticleController);

    expect(path).toBe('article');
  });

  describe('getAll', () => {
    it('should be GET /', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.getAll);
      const path = Reflect.getMetadata(PATH_METADATA, controller.getAll);

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'getAll',
      );

      expect(paramsTypes[0]).toBe(ArticleListFiltersDto);
    });

    it('should return correct format', async () => {
      mockService.getAll.mockResolvedValue([article]);
      const result = await controller.getAll({});

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(ArticleEntity);
    });
  });

  describe('getAllPaginated', () => {
    it('should be GET /paginated', () => {
      const method = Reflect.getMetadata(
        METHOD_METADATA,
        controller.getAllPaginated,
      );
      const path = Reflect.getMetadata(
        PATH_METADATA,
        controller.getAllPaginated,
      );

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('paginated');
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'getAllPaginated',
      );

      expect(paramsTypes[0]).toBe(ArticleListFiltersPaginatedDto);
    });

    it('should return correct format', async () => {
      const paginationParams = {
        page: 3,
        limit: 20,
        sortKey: 'status',
        sortOrder: SortOrder.ASC,
      };
      const paginatedResponse = new PaginatedResponseDto(
        [article],
        4,
        paginationParams.page,
        paginationParams.limit,
      );
      mockService.getAllPaginated.mockResolvedValue(paginatedResponse);
      const result = await controller.getAllPaginated(paginationParams as any);

      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('create', () => {
    it('should be POST /', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.create);
      const path = Reflect.getMetadata(PATH_METADATA, controller.create);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('/');
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'create',
      );

      expect(paramsTypes[0]).toBe(CreateArticleDto);
    });

    it('should return correct format', async () => {
      mockService.create.mockResolvedValue(article);
      const result = await controller.create({
        title: 'title',
        content: 'content',
      } as any);

      expect(result).toBeInstanceOf(ArticleEntity);
    });

    it('should be restricted to Admin', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.create,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([{ roles: [UserRole.admin] }]),
      );
    });

    it('should be restricted to Editor where authorId is authenticated user id', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.create,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([
          {
            roles: [UserRole.editor],
            constraints: { bodyPropertyName: 'authorId' },
          },
        ]),
      );
    });
  });

  describe('getById', () => {
    it('should be GET /:id', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.getById);
      const path = Reflect.getMetadata(PATH_METADATA, controller.getById);

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe(':id');
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'getById',
      );

      expect(paramsTypes[0]).toBe(IdParamDto);
    });

    it('should return correct format', async () => {
      mockService.getById.mockResolvedValue(article);
      const result = await controller.getById({ id: 'id' });

      expect(result).toBeInstanceOf(ArticleEntity);
    });
  });

  describe('update', () => {
    it('should be PUT /:id', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.update);
      const path = Reflect.getMetadata(PATH_METADATA, controller.update);

      expect(method).toBe(RequestMethod.PUT);
      expect(path).toBe(':id');
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'update',
      );

      expect(paramsTypes[0]).toBe(IdParamDto);
      expect(paramsTypes[1]).toBe(UpdateArticleDto);
    });

    it('should return correct format', async () => {
      mockService.update.mockResolvedValue(article);
      const result = await controller.update(
        { id: 'id' },
        { content: 'content' },
      );

      expect(result).toBeInstanceOf(ArticleEntity);
    });

    it('should be restricted to Admin', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.update,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([{ roles: [UserRole.admin] }]),
      );
    });

    it('should be restricted to Editor where authorId is authenticated user id', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.update,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([
          {
            roles: [UserRole.editor],
            constraints: {
              service: ArticleService,
              paramName: 'id',
              propertyName: 'authorId',
            },
          },
        ]),
      );
    });
  });

  describe('delete', () => {
    it('should be DELETE /:id', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.delete);
      const path = Reflect.getMetadata(PATH_METADATA, controller.delete);

      expect(method).toBe(RequestMethod.DELETE);
      expect(path).toBe(':id');
    });

    it('should respond with 204', () => {
      const statusCode = Reflect.getMetadata(
        HTTP_CODE_METADATA,
        controller.delete,
      );

      expect(statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'delete',
      );

      expect(paramsTypes[0]).toBe(IdParamDto);
    });

    it('should return correct format', async () => {
      mockService.delete.mockResolvedValue(article);
      const result = await controller.delete({ id: 'id' });

      expect(result).toBeUndefined();
    });

    it('should be restricted to Admin', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.delete,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([{ roles: [UserRole.admin] }]),
      );
    });

    it('should be restricted to Editor where authorId is authenticated user id', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.delete,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([
          {
            roles: [UserRole.editor],
            constraints: {
              service: ArticleService,
              paramName: 'id',
              propertyName: 'authorId',
            },
          },
        ]),
      );
    });
  });
});
