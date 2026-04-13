import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignupDto } from './models/signup.dto';
import { Prisma, UserRole } from '@prisma/client';
import { LoginDto } from './models/login.dto';
import {
  verifyPassword,
  hashPassword,
} from 'src/user/utils/password-hashing.util';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import {
  AuthEntity,
  AuthPayloadUser,
  AuthUserEntity,
} from './models/atuh.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/user/models/user.entity';
import { RefreshDto } from './models/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async generateTokens(user: UserEntity) {
    const payload = { sub: user.id, login: user.login, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.TOKEN_EXPIRE_TIME as SignOptions['expiresIn'],
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_REFRESH_KEY,
      expiresIn: process.env
        .TOKEN_REFRESH_EXPIRE_TIME as SignOptions['expiresIn'],
    });

    return new AuthEntity({ accessToken, refreshToken });
  }

  private async updateUserRefreshToken(
    id: string,
    refreshToken: string,
    tx?: Prisma.TransactionClient,
  ) {
    const refreshTokenHash = await hashPassword(refreshToken);

    return this.userService.update(id, { refreshTokenHash }, tx);
  }

  async signup(data: SignupDto) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await this.userService.create(
        {
          ...data,
          role: UserRole.viewer,
        },
        tx,
      );

      const tokens = await this.generateTokens(user);
      const updatedUser = await this.updateUserRefreshToken(
        user.id,
        tokens.refreshToken,
        tx,
      );

      return new AuthUserEntity({ ...updatedUser, ...tokens });
    });
  }

  async login(data: LoginDto) {
    const user = await this.userService.getOne({ login: data.login });
    if (!user) throw new ForbiddenException();

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) throw new ForbiddenException();

    const tokens = await this.generateTokens(user);
    await this.updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async refresh(data: RefreshDto, authUser: AuthPayloadUser) {
    const user = await this.userService.getOne({ id: authUser.sub });

    if (!user || !user.refreshTokenHash) throw new ForbiddenException();

    const isValidToken = await verifyPassword(
      data.refreshToken,
      user.refreshTokenHash,
    );

    if (!isValidToken) throw new ForbiddenException();

    const tokens = await this.generateTokens(user);
    await this.updateUserRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
