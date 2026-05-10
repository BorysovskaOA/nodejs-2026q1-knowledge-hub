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
import { SortOrder } from 'src/core/dtos/sorting.dto';
import { PaginatedResponseDto } from 'src/core/dtos/paginated-response.dto';
import { UserListFiltersPaginatedDto } from '../models/user-list-filter.dto';
import { CreateUserDto } from '../models/create-user.dto';
import { IdParamDto } from 'src/core/dtos/id-param.dto';
import { UpdatePasswordDto } from '../models/update-password.dto';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserEntity } from '../models/user.entity';

const user = new UserEntity({
  id: 'id',
  login: 'login',
  passwordHash: 'passwordHash',
  tokenVersion: 1,
  role: UserRole.viewer,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('User Controller', () => {
  let controller: UserController;

  const mockService = {
    getAll: vi.fn(),
    getAllPaginated: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    updatePassword: vi.fn(),
    delete: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should have the correct base path', () => {
    const path = Reflect.getMetadata(PATH_METADATA, UserController);

    expect(path).toBe('user');
  });

  describe('getAll', () => {
    it('should be GET /', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.getAll);
      const path = Reflect.getMetadata(PATH_METADATA, controller.getAll);

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });

    it('should return correct format', async () => {
      mockService.getAll.mockResolvedValue([user]);
      const result = await controller.getAll();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(UserEntity);
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

      expect(paramsTypes[0]).toBe(UserListFiltersPaginatedDto);
    });

    it('should return correct format', async () => {
      const paginationParams = {
        page: 3,
        limit: 20,
        sortKey: 'status',
        sortOrder: SortOrder.ASC,
      };
      const paginatedResponse = new PaginatedResponseDto(
        [user],
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

      expect(paramsTypes[0]).toBe(CreateUserDto);
    });

    it('should return correct format', async () => {
      mockService.create.mockResolvedValue(user);
      const result = await controller.create({
        title: 'title',
        content: 'content',
      } as any);

      expect(result).toBeInstanceOf(UserEntity);
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
      mockService.getById.mockResolvedValue(user);
      const result = await controller.getById({ id: 'id' });

      expect(result).toBeInstanceOf(UserEntity);
    });
  });

  describe('updatePassword', () => {
    it('should be PUT /:id', () => {
      const method = Reflect.getMetadata(
        METHOD_METADATA,
        controller.updatePassword,
      );
      const path = Reflect.getMetadata(
        PATH_METADATA,
        controller.updatePassword,
      );

      expect(method).toBe(RequestMethod.PUT);
      expect(path).toBe(':id');
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'updatePassword',
      );

      expect(paramsTypes[0]).toBe(IdParamDto);
      expect(paramsTypes[1]).toBe(UpdatePasswordDto);
    });

    it('should return correct format', async () => {
      mockService.updatePassword.mockResolvedValue(user);
      const result = await controller.updatePassword(
        { id: 'id' },
        { oldPassword: 'oldPassword', newPassword: 'newPassword' },
      );

      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should be restricted to Admin', () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.updatePassword,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([{ roles: [UserRole.admin] }]),
      );
    });

    it("should be restricted to other role where 'id' is authenticated user id", () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.updatePassword,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([
          {
            roles: [UserRole.editor, UserRole.viewer],
            constraints: {
              service: UserService,
              paramName: 'id',
              propertyName: 'id',
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
      mockService.delete.mockResolvedValue(user);
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

    it("should be restricted to other role where 'id' is authenticated user id", () => {
      const authOptions = Reflect.getMetadata(
        AUTHZ_OPTIONS_KEY,
        controller.delete,
      );

      expect(authOptions).toEqual(
        expect.arrayContaining([
          {
            roles: [UserRole.editor, UserRole.viewer],
            constraints: {
              service: UserService,
              paramName: 'id',
              propertyName: 'id',
            },
          },
        ]),
      );
    });
  });
});
