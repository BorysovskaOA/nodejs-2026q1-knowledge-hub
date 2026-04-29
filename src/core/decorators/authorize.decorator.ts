import { SetMetadata } from '@nestjs/common';

export interface AuthzOptions {
  roles?: string[];
  owner?: {
    service: any;
    paramName: string;
    propertyName: string;
  };
}

export const AUTHZ_OPTIONS_KEY = 'authz_options';
export const Authorize = (authzOptions: AuthzOptions) =>
  SetMetadata(AUTHZ_OPTIONS_KEY, authzOptions);
