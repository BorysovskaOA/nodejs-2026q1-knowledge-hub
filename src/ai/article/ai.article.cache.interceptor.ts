import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import {
  Injectable,
  ExecutionContext,
  Inject,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { Cache } from 'cache-manager';
import { AiMonitorService } from '../ai.monitoring.service';

@Injectable()
export class AiArticleCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger('CACHE');

  constructor(
    @Inject(CACHE_MANAGER) cache: Cache,
    reflector: Reflector,
    private aiMonitorService: AiMonitorService,
  ) {
    super(cache, reflector);
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const allowedMethods = ['GET', 'POST'];
    return allowedMethods.includes(request.method);
  }

  async trackBy(context: ExecutionContext): Promise<string> {
    const request = context.switchToHttp().getRequest();
    const { articleId } = request.params;

    const updatedAt = await this.cacheManager.get(
      `article:${articleId}:lastUpdated`,
    );

    const bodyKey = JSON.stringify(request.body);
    return `ai:${articleId}:${updatedAt || 'initial'}:${bodyKey}`;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const key = await this.trackBy(context);

    const cachedData = await this.cacheManager.get(key);
    const response = context.switchToHttp().getResponse();

    const routePath = request.route.path;
    const endpoint = routePath.split('/').pop();

    if (cachedData) {
      this.logger.debug({ key }, 'Cached');
      response.setHeader('X-Cache', 'HIT');

      const latency = Date.now() - start;
      this.aiMonitorService.track(endpoint, true, latency);
      return of(cachedData);
    }

    response.setHeader('X-Cache', 'MISS');

    return (await super.intercept(context, next)).pipe(
      tap(() => {
        const latency = Date.now() - start;
        this.aiMonitorService.track(endpoint, false, latency);
      }),
    );
  }
}
