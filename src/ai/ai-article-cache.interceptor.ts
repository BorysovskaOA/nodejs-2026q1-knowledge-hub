import { CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AiArticleCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { articleId } = request.params;
    const bodyKey = JSON.stringify(request.body);
    return `ai:${articleId}:${bodyKey}`;
  }
}
