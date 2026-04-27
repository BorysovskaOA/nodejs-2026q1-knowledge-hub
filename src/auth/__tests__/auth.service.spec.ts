import { JwtService } from '@nestjs/jwt';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
  vi,
} from 'vitest';
import { UserService } from 'src/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from 'src/user/models/user.entity';
import { UserRole } from '@prisma/client';
import { hashCompare } from 'src/core/utils/hashing.util';
import { AuthService } from '../auth.service';
import { AuthEntity, AuthUserEntity } from '../models/auth.entity';
import { ForbiddenError } from 'src/core/exceptions/app-errors';

vi.mock('src/core/utils/hashing.util', () => ({
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

const tokens = new AuthEntity({
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
});

const authUser = new AuthUserEntity({
  ...user,
  ...tokens,
});

const payload = {
  userId: user.id,
  login: user.login,
  role: user.role,
  version: user.tokenVersion,
};

describe('Auth Service', () => {
  let service: AuthService;

  const mockUserService = {
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const mockJwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET_KEY', 'test_secret');
    vi.stubEnv('TOKEN_EXPIRE_TIME', '15m');
    vi.stubEnv('JWT_SECRET_REFRESH_KEY', 'test_secret_refresh');
    vi.stubEnv('TOKEN_REFRESH_EXPIRE_TIME', '1d');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.mocked(hashCompare).mockResolvedValue(true);
    mockJwtService.signAsync
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  describe('signup', () => {
    const createData = {
      login: 'login',
      password: 'password',
    };

    beforeEach(() => {
      mockUserService.create.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.signup(createData);

      expect(result).toBeInstanceOf(AuthUserEntity);
      expect(result).toMatchObject(authUser);
    });

    it('should create tokens', async () => {
      await service.signup(createData);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
        secret: 'test_secret',
        expiresIn: '15m',
      });
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, payload, {
        secret: 'test_secret_refresh',
        expiresIn: '1d',
      });
    });
  });

  describe('login', () => {
    const data = {
      login: 'login',
      password: 'password',
    };
    beforeEach(() => {
      mockUserService.getOne.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.login(data);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
        secret: 'test_secret',
        expiresIn: '15m',
      });
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, payload, {
        secret: 'test_secret_refresh',
        expiresIn: '1d',
      });
      expect(result).toBeInstanceOf(AuthEntity);
      expect(result).toMatchObject(tokens);
    });

    it('throws ForbiddenError if no user found', async () => {
      mockUserService.getOne.mockResolvedValue(null);

      await expect(service.login(data)).rejects.toThrow(ForbiddenError);
    });

    it('throws ForbiddenError if password is invalid', async () => {
      vi.mocked(hashCompare).mockResolvedValue(false);
      await expect(service.login(data)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('refresh', () => {
    const data = {
      refreshToken: 'refreshToken',
    };

    beforeEach(() => {
      mockUserService.getOne.mockResolvedValue(user);
      mockJwtService.verifyAsync.mockResolvedValue(payload);
    });

    it('returns data correctly', async () => {
      const result = await service.refresh(data);

      expect(result).toBeInstanceOf(AuthEntity);
      expect(result).toMatchObject(tokens);
    });

    it('should create tokens', async () => {
      await service.refresh(data);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
        secret: 'test_secret',
        expiresIn: '15m',
      });
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, payload, {
        secret: 'test_secret_refresh',
        expiresIn: '1d',
      });
    });

    it('throws ForbiddenError if token is not valid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error());

      await expect(service.refresh(data)).rejects.toThrow(ForbiddenError);
    });

    it('throws ForbiddenError if user id not found', async () => {
      mockUserService.getOne.mockResolvedValue(null);

      await expect(service.refresh(data)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      mockUserService.update.mockResolvedValue(user);
    });

    it('returns data correctly', async () => {
      const result = await service.logout(user);

      expect(result).toBeUndefined();
      expect(mockUserService.update).toHaveBeenCalledTimes(1);
      expect(mockUserService.update).toHaveBeenCalledWith(user.id, {
        tokenVersion: user.tokenVersion + 1,
      });
    });
  });
});
