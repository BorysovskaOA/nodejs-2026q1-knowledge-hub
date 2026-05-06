import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AiArticleCacheInterceptor extends CacheInterceptor {
  constructor(@Inject(CACHE_MANAGER) cache, reflector: Reflector) {
    super(cache, reflector);
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const allowedMethods = ['GET', 'POST'];
    return allowedMethods.includes(request.method);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { articleId } = request.params;
    const bodyKey = JSON.stringify(request.body);
    return `ai:${articleId}:${bodyKey}`;
  }
}
