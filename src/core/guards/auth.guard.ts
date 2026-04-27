import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator';
import { AuthPayloadUser } from '../../auth/models/auth.entity';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/models/user.entity';
import { ForbiddenError, UnauthorizedError } from '../exceptions/app-errors';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AUTH');

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedError(
        { service: AuthGuard.name },
        'Credentials are invalid',
      );
    }

    let payload: AuthPayloadUser;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
    } catch (err) {
      throw new UnauthorizedError(
        { service: AuthGuard.name, accessToken: token, error: err.message },
        'Credentials are invalid',
      );
    }

    let user: UserEntity | null;
    try {
      user = await this.userService.getOne({ id: payload.userId });
    } catch (err) {
      throw new UnauthorizedError(
        { service: AuthGuard.name, payload, error: err.message },
        'Credentials are invalid',
      );
    }

    if (!user || payload.version !== user?.tokenVersion) {
      throw new ForbiddenError(
        { service: AuthGuard.name, user, payload },
        'Access denied',
      );
    }

    request.user = user;

    this.logger.debug({ user }, 'Auth succeed:');
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
