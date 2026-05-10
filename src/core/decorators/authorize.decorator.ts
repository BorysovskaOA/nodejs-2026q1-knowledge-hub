import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
export interface AuthParamConstraints {
  service: any;
  paramName?: string;
  propertyName: string;
}

export interface AuthBodyConstraints {
  bodyPropertyName?: string;
}

export interface AuthzOption {
  roles: UserRole[];
  constraints?: AuthParamConstraints | AuthBodyConstraints;
}

export const AUTHZ_OPTIONS_KEY = 'authz_options';
export const Authorize = (authzOptions: AuthzOption[]) =>
  SetMetadata(AUTHZ_OPTIONS_KEY, authzOptions);
