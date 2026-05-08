import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AiMonitoringService } from './monitoring/ai.monitoring.service';

@Injectable()
export class LatencyInterceptor implements NestInterceptor {
  constructor(private aiMonitoringService: AiMonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const endpoint = request.route.path;

    return next.handle().pipe(
      tap(() => {
        const latency = Date.now() - start;
        this.aiMonitoringService.track(endpoint, false, latency);
      }),
      catchError((err) => {
        const latency = Date.now() - start;
        this.aiMonitoringService.track(`${endpoint} [ERROR]`, false, latency);
        return throwError(() => err);
      }),
    );
  }
}
