import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { IResponse } from '../interfaces';
export declare class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>>;
}
