import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
export interface AuthParamConstraints {
  service: any;
  paramName: string;
  userPropertyName: string;
}

export interface AuthBodyConstraints {
  bodyPropertyName: string;
  required?: boolean;
  service?: any;
  userPropertyName?: string;
}

export interface AuthQueryConstraints {
  queryPropertyName: string;
  required?: boolean;
  service?: any;
  userPropertyName?: string;
}

export interface AuthzOption {
  roles: UserRole[];
  constraints?:
    | AuthParamConstraints
    | AuthBodyConstraints
    | AuthQueryConstraints;
}

export const AUTHZ_OPTIONS_KEY = 'authz_options';
export const Authorize = (authzOptions: AuthzOption[]) =>
  SetMetadata(AUTHZ_OPTIONS_KEY, authzOptions);
