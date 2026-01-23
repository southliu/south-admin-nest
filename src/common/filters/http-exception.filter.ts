import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogService } from '../../log/log.service';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private logService: LogService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const error =
      exception instanceof HttpException
        ? JSON.stringify(exception.getResponse())
        : String(exception);

    // 异步记录日志到数据库
    this.logError(request, status, error).catch((err) => {
      this.logger.error('Failed to log error:', err);
    });

    // 打印日志到控制台
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      error,
    );

    response.status(status).json({
      success: false,
      code: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private async logError(request: Request, status: number, error: string) {
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
        status: `${status}`,
        error,
        latency: 0,
        type: 0, // 错误日志 type=0
      });
    } catch (err) {
      // 日志记录失败不影响主流程
      this.logger.error('Failed to save error log:', err);
    }
  }
}
