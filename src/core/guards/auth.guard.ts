import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator';
import { AuthPayloadUser } from '../../auth/models/auth.entity';
import { UserService } from 'src/user/user.service';
import { StatusCodes } from 'http-status-codes';

@Injectable()
export class AuthGuard implements CanActivate {
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
      throw new UnauthorizedException();
    }
    try {
      const payload: AuthPayloadUser = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET_KEY,
        },
      );

      const user = await this.userService.getOne({ id: payload.userId });

      if (!user || payload.version !== user?.tokenVersion)
        throw new ForbiddenException();

      request['user'] = user;
      return true;
    } catch (err) {
      if (err?.statusCode === StatusCodes.FORBIDDEN)
        throw new ForbiddenException();
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
