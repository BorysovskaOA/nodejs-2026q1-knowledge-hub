import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { HttpStatus, RequestMethod } from '@nestjs/common';
import { AUTHZ_OPTIONS_KEY } from 'src/core/decorators/authorize.decorator';
import { UserRole } from '@prisma/client';
import { CreateCategoryDto } from '../models/create-category.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { CategoryEntity } from '../models/category.entity';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../categoty.service';

const category = new CategoryEntity({
  id: 'id',
  name: 'Name',
  description: 'Description',
});

describe('Category Controller', () => {
  let controller: CategoryController;

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
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should have the correct base path', () => {
    const path = Reflect.getMetadata(PATH_METADATA, CategoryController);

    expect(path).toBe('category');
  });

  describe('getAll', () => {
    it('should be GET /', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.getAll);
      const path = Reflect.getMetadata(PATH_METADATA, controller.getAll);

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });

    it('should return correct format', async () => {
      mockService.getAll.mockResolvedValue([category]);
      const result = await controller.getAll();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(CategoryEntity);
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

      expect(paramsTypes[0]).toBe(CreateCategoryDto);
    });

    it('should return correct format', async () => {
      mockService.create.mockResolvedValue(category);
      const result = await controller.create({
        title: 'title',
        content: 'content',
      } as any);

      expect(result).toBeInstanceOf(CategoryEntity);
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
      mockService.getById.mockResolvedValue(category);
      const result = await controller.getById({ id: 'id' });

      expect(result).toBeInstanceOf(CategoryEntity);
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
      expect(paramsTypes[1]).toBe(CreateCategoryDto);
    });

    it('should return correct format', async () => {
      mockService.update.mockResolvedValue(category);
      const result = await controller.update(
        { id: 'id' },
        { name: 'name', description: 'description' },
      );

      expect(result).toBeInstanceOf(CategoryEntity);
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
      mockService.delete.mockResolvedValue(category);
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
  });
});
