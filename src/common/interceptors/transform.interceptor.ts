import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse, IResponseObj } from '../interfaces';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || HttpStatus.OK;

        // If data is already formatted with our structure, use it
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data as IResponse<T>;
        }

        // Handle paginated responses
        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'total' in data
        ) {
          const returnObject: IResponseObj<T> = {
            statusCode,
            data: data.items,
            message: data.message || 'Success',
            totalCount: data.total,
            pagination: data.pagination,
          };
          return returnObject;
        }

        // Standard response format
        const returnObject: IResponseObj<T> = {
          statusCode,
          data: data?.data !== undefined ? data.data : data,
          message: data?.message || 'Success',
          totalCount: data?.totalCount,
          pagination: data?.pagination,
        };

        return returnObject;
      }),
    );
  }
}
