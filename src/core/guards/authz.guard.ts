import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  AuthBodyConstraints,
  AuthParamConstraints,
  AUTHZ_OPTIONS_KEY,
  AuthzOption,
} from '../decorators/authorize.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { ForbiddenError } from '../exceptions/app-errors';

@Injectable()
export class AuthzGuard implements CanActivate {
  private readonly logger = new Logger('AUTHZ');

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authzOptions = this.reflector.getAllAndOverride<AuthzOption[]>(
      AUTHZ_OPTIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!authzOptions || !authzOptions.length) {
      return true;
    }

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();

    const validationResults = await Promise.all(
      authzOptions.map((o) => this.isAllowedByAuthOption(o, request)),
    );

    if (!validationResults.includes(true))
      throw new ForbiddenError(
        {
          service: AuthzGuard.name,
          authzOptions,
          user: request.user,
        },
        'Access denied',
      );

    this.logger.verbose({ authzOptions, user: request.user }, 'Access alloed:');
    return true;
  }

  private async isAllowedByAuthOption(
    authzOption: AuthzOption,
    request: AuthenticatedRequest,
  ) {
    if (!authzOption.roles.includes(request.user.role)) {
      return false;
    }

    if (!authzOption.constraints) return true;

    const ownerParam = authzOption.constraints as AuthParamConstraints;
    const ownerBody = authzOption.constraints as AuthBodyConstraints;

    if (ownerParam.paramName) {
      const resourceId = request.params[ownerParam.paramName];

      if (!resourceId) return false;

      const service = this.moduleRef.get(ownerParam.service, {
        strict: false,
      });

      try {
        const resource = await service.getOne({ id: resourceId });

        const isOwner = !!(
          resource?.[ownerParam.propertyName] === request.user.id
        );

        if (!isOwner) {
          return false;
        }
      } catch (err) {
        return false;
      }
    }

    if (ownerBody.bodyPropertyName) {
      const isOwner = !!(
        request.body[ownerBody.bodyPropertyName] === request.user.id
      );

      if (!isOwner) {
        return false;
      }
    }

    return true;
  }
}
