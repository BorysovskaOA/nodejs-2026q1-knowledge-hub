import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryEntity } from '../models/category.entity';
import { CategoryService } from '../categoty.service';
import { CategoryRepository } from '../category.repository';

const category = new CategoryEntity({
  id: 'id',
  name: 'name',
  description: 'description',
});

describe('Category Service', () => {
  let service: CategoryService;

  const mockRepository = {
    findAll: vi.fn(),
    findAllPaginated: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('create', () => {
    const createData = {
      name: 'name',
      description: 'description',
    };

    beforeEach(() => {
      mockRepository.create.mockResolvedValue(category);
    });

    it('returns data correctly', async () => {
      const result = await service.create(createData);

      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(category);
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([category]);
    });

    it('returns data correctly', async () => {
      const result = await service.getAll();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(CategoryEntity);
      expect(result[0]).toMatchObject(category);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(category);
    });

    it('returns data correctly', async () => {
      const result = await service.getById('id');

      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(category);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOne', () => {
    const filter = { name: 'name' };
    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(category);
    });

    it('returns data correctly', async () => {
      const result = await service.getOne(filter);

      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(category);
    });

    it('returns null if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getOne(filter);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = { name: 'name', description: 'Description' };

    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(category);
      mockRepository.update.mockResolvedValue(category);
    });

    it('returns data correctly', async () => {
      const result = await service.update('id', updateData);

      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(category);
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
      mockRepository.findById.mockResolvedValue(category);
      mockRepository.delete.mockResolvedValue(category);
    });

    it('returns data correctly', async () => {
      const result = await service.delete('id');

      expect(result).toBeInstanceOf(CategoryEntity);
      expect(result).toMatchObject(category);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUserExist', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(category);
    });

    it('returns true if exist', async () => {
      const result = await service.validateCategoryExist('id');

      expect(result).toBeTruthy();
    });

    it('returns false if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      const result = await service.validateCategoryExist('id');

      expect(result).toBeFalsy();
    });
  });

  describe('validateUserExistWithException', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(category);
    });

    it('should not return anything if exist', async () => {
      const result = await service.validateCategoryExistWithException('id');

      expect(result).toBeUndefined();
    });

    it('throws BadRequestException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.validateCategoryExistWithException('id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
