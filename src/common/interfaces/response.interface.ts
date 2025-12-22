export interface IPagination {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IResponse<T> {
  statusCode: number;
  data: T;
  message?: string;
  totalCount?: number;
  pagination?: IPagination;
}

export interface IResponseObj<T> {
  statusCode: number;
  data: T;
  message?: string;
  totalCount?: number;
  pagination?: IPagination;
}
