import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignupDto } from './models/signup.dto';
import { UserRole } from '@prisma/client';
import { LoginDto } from './models/login.dto';
import { hashCompare } from 'src/core/utils/hashing.util';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import {
  AuthEntity,
  AuthPayloadUser,
  AuthUserEntity,
} from './models/auth.entity';
import { UserEntity } from 'src/user/models/user.entity';
import { RefreshDto } from './models/refresh.dto';
import { ForbiddenError } from 'src/core/exceptions/app-errors';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/core/configs/env.config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables, true>,
  ) { }

  private async generateTokens(user: UserEntity) {
    const payload = {
      userId: user.id,
      login: user.login,
      role: user.role,
      version: user.tokenVersion,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      expiresIn: this.configService.get('TOKEN_EXPIRE_TIME'),
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET_REFRESH_KEY'),
      expiresIn: this.configService.get('TOKEN_REFRESH_EXPIRE_TIME'),
    });

    return new AuthEntity({ accessToken, refreshToken });
  }

  async signup(data: SignupDto) {
    const user = await this.userService.create({
      ...data,
      role: UserRole.viewer,
    });

    const tokens = await this.generateTokens(user);

    // It's not required in task, but it's a good practice to log newly created user immediately with 1 request
    return new AuthUserEntity({ ...user, ...tokens });
  }

  async login(data: LoginDto) {
    const user = await this.userService.getOne({ login: data.login });
    if (!user)
      throw new ForbiddenError('Credential are invalid', AuthService.name);

    const isValid = await hashCompare(data.password, user.passwordHash);
    if (!isValid)
      throw new ForbiddenError('Credential are invalid', AuthService.name);

    return this.generateTokens(user);
  }

  async refresh(data: RefreshDto) {
    let payload: AuthPayloadUser;
    try {
      payload = await this.jwtService.verifyAsync(data.refreshToken, {
        secret: this.configService.get('JWT_SECRET_REFRESH_KEY'),
      });
    } catch {
      throw new ForbiddenError('Access Denied', AuthService.name);
    }

    const user = await this.userService.getOne({
      id: payload.userId,
    });
    if (!user) throw new ForbiddenError('Access Denied', AuthService.name);

    return this.generateTokens(user);
  }

  async logout(user: UserEntity) {
    await this.userService.update(user.id, {
      tokenVersion: user.tokenVersion + 1,
    });
  }
}
