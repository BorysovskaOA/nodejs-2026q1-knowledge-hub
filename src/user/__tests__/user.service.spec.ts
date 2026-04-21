import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { UserService } from '../user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../models/user.entity';
import { UserRole } from '@prisma/client';
import { UserRepository } from '../user.repository';
import { hash, hashCompare } from 'src/core/utils/hashing.util';
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

vi.mock('src/core/utils/hashing.util', () => ({
  hash: vi.fn(),
  hashCompare: vi.fn(),
}));

const user = new UserEntity({
  id: 'id',
  login: 'login',
  passwordHash: 'passwordHash',
  tokenVersion: 1,
  role: UserRole.viewer,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('User Service', () => {
  let service: UserService;

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
        UserService,
        {
          provide: UserRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.mocked(hash).mockResolvedValue('passwordHash');
    vi.mocked(hashCompare).mockResolvedValue(true);
  });

  describe('create', () => {
    const createData = {
      login: 'login',
      password: 'password',
      role: UserRole.admin,
    };

    beforeEach(() => {
      mockRepository.create.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.create(createData);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(user);
    });

    it('should hash password', async () => {
      await service.create(createData);

      expect(hash).toHaveBeenCalledTimes(1);
      expect(hash).toHaveBeenCalledWith(createData.password);
    });
  });

  describe('getAll', () => {
    beforeEach(() => {
      mockRepository.findAll.mockResolvedValue([user]);
    });

    it('returns data correctly', async () => {
      const result = await service.getAll();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(UserEntity);
      expect(result[0]).toMatchObject(user);
    });
  });

  describe('getAllPaginated', () => {
    const paginationParams = {
      page: 3,
      limit: 20,
      sortKey: 'createdAt',
      sortOrder: SortOrder.ASC,
    };

    beforeEach(() => {
      mockRepository.findAllPaginated.mockResolvedValue(
        new PaginatedResponseDto(
          [user],
          1,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    });

    it('returns data correctly', async () => {
      const result = await service.getAllPaginated(paginationParams as any);

      expect(result).toBeInstanceOf(PaginatedResponseDto);
      expect(result.data[0]).toBeInstanceOf(UserEntity);
      expect(result.data[0]).toMatchObject(user);
    });
  });

  describe('getById', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.getById('id');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(user);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOne', () => {
    const filter = { login: 'login' };
    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.getOne(filter);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(user);
    });

    it('returns null if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getOne(filter);

      expect(result).toBeNull();
    });
  });

  describe('updatePassword', () => {
    const updatePasswordData = {
      oldPassword: 'password',
      newPassword: 'newPassword',
    };

    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.update.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.updatePassword('id', updatePasswordData);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(user);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePassword('id', updatePasswordData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify old password hash', async () => {
      await service.updatePassword('id', updatePasswordData);

      expect(hashCompare).toHaveBeenCalledTimes(1);
      expect(hashCompare).toHaveBeenCalledWith(
        updatePasswordData.oldPassword,
        'passwordHash',
      );
    });

    it('throws ForbiddenException if old password id not correct', async () => {
      vi.mocked(hashCompare).mockResolvedValue(false);

      await expect(
        service.updatePassword('id', updatePasswordData),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should hash new password', async () => {
      await service.updatePassword('id', updatePasswordData);

      expect(hash).toHaveBeenCalledTimes(1);
      expect(hash).toHaveBeenCalledWith(updatePasswordData.newPassword);
    });
  });

  describe('update', () => {
    const updateData = { role: UserRole.editor };

    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.update.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.update('id', updateData);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(user);
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
      mockRepository.findById.mockResolvedValue(user);
      mockRepository.delete.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.delete('id');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(user);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUserExist', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(user);
    });

    it('returns true if exist', async () => {
      const result = await service.validateUserExist('id');

      expect(result).toBeTruthy();
    });

    it('returns false if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      const result = await service.validateUserExist('id');

      expect(result).toBeFalsy();
    });
  });

  describe('validateUserExistWithException', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(user);
    });

    it('should not return anything if exist', async () => {
      const result = await service.validateUserExistWithException('id');

      expect(result).toBeUndefined();
    });

    it('throws BadRequestException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.validateUserExistWithException('id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
