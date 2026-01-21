export class ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;

  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      timestamp: Date.now(),
    };
  }

  static error(
    message: string = 'Error',
    code: number = 500,
    data?: any,
  ): ApiResponse {
    return {
      code,
      message,
      data,
      timestamp: Date.now(),
    };
  }
}

export class PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;

  constructor(items: T[], page: number, pageSize: number, total: number) {
    this.items = items;
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.totalPages = Math.ceil(total / pageSize);
  }
}
