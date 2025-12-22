import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { IResponse } from '../interfaces';

interface ExtendedRequest extends Request {
  userDetails?: {
    userId?: string;
    email?: string;
  };
  user?: {
    id?: string;
    email?: string;
  };
}

@Injectable()
export class LogInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const req = context.switchToHttp().getRequest<ExtendedRequest>();
    const { method, url } = req;
    const now = Date.now();
    const requestId = uuid();

    // Get user ID from either userDetails or user object
    const userId = req.userDetails?.userId || req.user?.id || 'anonymous';

    this.logger.log(
      `[${requestId}] --> [REQUEST] ${method} ${url} - userId: ${userId}`,
    );

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const duration = Date.now() - now;
        this.logger.log(
          `[${requestId}] <-- [RESPONSE] ${method} ${url} - ${statusCode} - ${duration}ms`,
        );
      }),
      catchError((err) => {
        const statusCode = err.status || 500;
        const duration = Date.now() - now;
        this.logger.error(
          `[${requestId}] <-- [ERROR] ${method} ${url} - ${statusCode} - ${duration}ms - userId: ${userId} - ${err.message}`,
        );
        return throwError(() => err);
      }),
    );
  }
}
