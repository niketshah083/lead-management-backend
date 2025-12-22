import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IResponse } from '../interfaces';
export declare class LogInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>>;
}
