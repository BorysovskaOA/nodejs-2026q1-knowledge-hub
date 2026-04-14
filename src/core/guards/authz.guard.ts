import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  AUTHZ_OPTIONS_KEY,
  AuthzOptions,
} from '../decorators/authorize.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated_request.interface';

@Injectable()
export class AuthzGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authzOptions = this.reflector.getAllAndOverride<AuthzOptions>(
      AUTHZ_OPTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!authzOptions) {
      return true;
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    if (authzOptions.roles && authzOptions.roles.includes(request.user.role)) {
      return true;
    }

    if (!authzOptions.owner) throw new ForbiddenException();

    const resourceId = request.params[authzOptions.owner.paramName];
    if (!resourceId) throw new ForbiddenException();

    const service = this.moduleRef.get(authzOptions.owner.service, {
      strict: false,
    });
    const resource = await service.getOne({ id: resourceId });
    const isOwner = !!(
      resource?.[authzOptions.owner.propertyName] === request.user.userId
    );

    if (!isOwner) throw new ForbiddenException();

    return isOwner;
  }
}
