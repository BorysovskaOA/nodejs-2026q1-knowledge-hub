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
  AuthQueryConstraints,
  AUTHZ_OPTIONS_KEY,
  AuthzOption,
} from '../decorators/authorize.decorator';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { ForbiddenError } from '../exceptions/app-errors';

@Injectable()
export class AuthzGuard implements CanActivate {
  private readonly logger: Logger;

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {
    this.logger = new Logger('AUTHZ');
  }

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
      throw new ForbiddenError('Access denied', {
        service: AuthzGuard.name,
        authzOptions,
        user: request.user,
      });

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
    const ownerQuery = authzOption.constraints as AuthQueryConstraints;

    const resourceId = this.getResourceId(authzOption, request);

    const isRequired =
      !!ownerParam.paramName || !!ownerBody.required || !!ownerQuery.required;

    if (!resourceId && isRequired) {
      return false;
    }

    if (
      authzOption.constraints.service &&
      authzOption.constraints.userPropertyName
    ) {
      const service = this.moduleRef.get(ownerParam.service, {
        strict: false,
      });

      const resource = await service.getOne({ id: resourceId });

      const isOwner = !!(
        resource?.[ownerParam.userPropertyName] === request.user.id
      );

      if (!isOwner) {
        return false;
      }
    } else {
      if (ownerBody.bodyPropertyName || ownerQuery.queryPropertyName) {
        const isOwner = !!(resourceId === request.user.id);

        if (!isOwner) {
          return false;
        }
      }
    }

    return true;
  }

  getResourceId(authzOption: AuthzOption, request: AuthenticatedRequest) {
    const ownerParam = authzOption.constraints as AuthParamConstraints;
    const ownerBody = authzOption.constraints as AuthBodyConstraints;
    const ownerQuery = authzOption.constraints as AuthQueryConstraints;

    if (ownerParam.paramName) {
      return request.params?.[ownerParam.paramName] as string;
    }

    if (ownerBody.bodyPropertyName) {
      return request.body?.[ownerBody.bodyPropertyName] as string;
    }

    if (ownerQuery.queryPropertyName) {
      return request.query?.[ownerQuery.queryPropertyName] as string;
    }

    return undefined;
  }
}
