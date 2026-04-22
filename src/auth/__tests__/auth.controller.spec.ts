import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GUARDS_METADATA,
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { HttpStatus, RequestMethod } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserEntity } from 'src/user/models/user.entity';
import { AuthEntity, AuthUserEntity } from '../models/auth.entity';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SignupDto } from '../models/signup.dto';
import { LoginDto } from '../models/login.dto';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { RefreshDto } from '../models/refresh.dto';
import { AuthenticatedRequest } from 'src/core/interfaces/authenticated-request.interface';
import { RouteParamtypes } from '@nestjs/common/enums/route-paramtypes.enum';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public-route.decorator';

const user = new UserEntity({
  id: 'id',
  login: 'login',
  passwordHash: 'passwordHash',
  tokenVersion: 1,
  role: UserRole.viewer,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const tokens = new AuthEntity({
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
});

const authUser = new AuthUserEntity({
  ...user,
  ...tokens,
});

const req = {
  user,
} as AuthenticatedRequest;

describe('Auth Controller', () => {
  let controller: AuthController;

  const mockService = {
    signup: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it('should have the correct base path', () => {
    const path = Reflect.getMetadata(PATH_METADATA, AuthController);

    expect(path).toBe('auth');
  });

  describe('signup', () => {
    it('should be POST /signup', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.signup);
      const path = Reflect.getMetadata(PATH_METADATA, controller.signup);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('signup');
    });

    it('should be public route', () => {
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.signup);

      expect(isPublic).toBeTruthy();
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'signup',
      );

      expect(paramsTypes[0]).toBe(SignupDto);
    });

    it('should return correct format', async () => {
      mockService.signup.mockResolvedValue(authUser);
      const result = await controller.signup({
        login: 'login',
        password: 'password',
      });

      expect(result).toBeInstanceOf(AuthUserEntity);
    });

    it('should be rate limit guarded', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        AuthController.prototype.refresh,
      );

      expect(guards).toContain(ThrottlerGuard);
    });
  });

  describe('login', () => {
    it('should be POST /login', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.login);
      const path = Reflect.getMetadata(PATH_METADATA, controller.login);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('login');
    });

    it('should respond with 200', () => {
      const statusCode = Reflect.getMetadata(
        HTTP_CODE_METADATA,
        controller.login,
      );

      expect(statusCode).toBe(HttpStatus.OK);
    });

    it('should be public route', () => {
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.signup);

      expect(isPublic).toBeTruthy();
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'login',
      );

      expect(paramsTypes[0]).toBe(LoginDto);
    });

    it('should return correct format', async () => {
      mockService.login.mockResolvedValue(tokens);
      const result = await controller.login({
        login: 'login',
        password: 'password',
      });

      expect(result).toBeInstanceOf(AuthEntity);
    });

    it('should be rate limit guarded', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        AuthController.prototype.refresh,
      );

      expect(guards).toContain(ThrottlerGuard);
    });
  });

  describe('refresh', () => {
    it('should be POST /refresh', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.refresh);
      const path = Reflect.getMetadata(PATH_METADATA, controller.refresh);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('refresh');
    });

    it('should respond with 200', () => {
      const statusCode = Reflect.getMetadata(
        HTTP_CODE_METADATA,
        controller.refresh,
      );

      expect(statusCode).toBe(HttpStatus.OK);
    });

    it('should be public route', () => {
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, controller.signup);

      expect(isPublic).toBeTruthy();
    });

    it('should take @RawBody as params', () => {
      const metadata = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        controller.constructor,
        'refresh',
      );

      const rawBodyKey = `${RouteParamtypes.RAW_BODY}:0`;

      expect(metadata[rawBodyKey]).toBeDefined();
    });

    it('should take correct arguments', async () => {
      const paramsTypes = Reflect.getMetadata(
        'design:paramtypes',
        controller,
        'refresh',
      );

      expect(paramsTypes[0]).toBe(RefreshDto);
    });

    it('should return correct format', async () => {
      mockService.refresh.mockResolvedValue(tokens);
      const result = await controller.refresh({ refreshToken: 'refreshToken' });

      expect(result).toBeInstanceOf(AuthEntity);
    });
  });

  describe('logout', () => {
    it('should be POST /logout', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, controller.logout);
      const path = Reflect.getMetadata(PATH_METADATA, controller.logout);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('logout');
    });

    it('should respond with 200', () => {
      const statusCode = Reflect.getMetadata(
        HTTP_CODE_METADATA,
        controller.refresh,
      );

      expect(statusCode).toBe(HttpStatus.OK);
    });

    it('should take @Req as params', async () => {
      const metadata = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        AuthController,
        'logout',
      );

      const reqKey = `${RouteParamtypes.REQUEST}:0`;
      expect(metadata[reqKey]).toBeDefined();
      expect(metadata[reqKey].index).toBe(0);
    });

    it('should return correct format', async () => {
      mockService.logout.mockResolvedValue(undefined);
      const result = await controller.logout(req);

      expect(result).toBeUndefined();
    });
  });
});
