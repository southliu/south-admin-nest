import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../responses/api-response.dto';

// 日期格式化函数
const formatDate = (date: any): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 递归格式化对象中的日期字段
const formatDates = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => formatDates(item));
  }

  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (
        (key === 'createdAt' || key === 'updatedAt') &&
        data[key] !== null &&
        data[key] !== undefined
      ) {
        result[key] = formatDate(data[key]);
      } else if (typeof data[key] === 'object') {
        result[key] = formatDates(data[key]);
      } else {
        result[key] = data[key];
      }
    }
  }
  return result;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ApiResponse) {
          data.data = formatDates(data.data);
          return data;
        }
        const formattedData = formatDates(data);
        return ApiResponse.success(formattedData);
      }),
    );
  }
}
