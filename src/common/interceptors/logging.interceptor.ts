import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { LogService } from '../../log/log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();

    const { url, method } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const latency = Date.now() - now;
          const status = 'success';

          // 异步记录成功请求日志到数据库，type=1
          this.logRequest(request, status, latency, 1).catch((err) => {
            this.logger.error('Failed to log request:', err);
          });

          // 打印日志到控制台
          this.logger.log(
            `${method} ${url} - Status: ${status} - Latency: ${latency}ms`,
          );
        },
        // 移除错误处理，错误日志由 HttpExceptionFilter 统一处理
      }),
      catchError((error) => {
        // 只打印控制台日志，不写入数据库（由 HttpExceptionFilter 处理）
        const latency = Date.now() - now;
        this.logger.error(
          `${method} ${url} - Error - Latency: ${latency}ms`,
          error,
        );
        // 重新抛出错误以便 ExceptionFilter 处理
        throw error;
      }),
    );
  }

  private async logRequest(
    request: Request,
    status: string,
    latency: number,
    type: number,
  ) {
    try {
      await this.logService.create({
        username: (request as any).user?.username || '',
        ip: request.ip || request.socket.remoteAddress || '',
        method: request.method,
        url: request.url,
        params: JSON.stringify({
          query: request.query,
          body: request.body,
        }),
        userAgent: request.get('user-agent') || '',
        status,
        error: null,
        latency,
        type,
      });
    } catch (err) {
      // 日志记录失败不影响主流程
      this.logger.error('Failed to save request log:', err);
    }
  }
}
