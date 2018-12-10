import { Injectable, NestInterceptor, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Response } from './response.class';
import { Response as Res } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<Response<T>, T> {
  intercept(context: ExecutionContext, call$: Observable<Response<T>>): Observable<T> {
    const httpResponse: Res = context.switchToHttp().getResponse();
    return call$.pipe(
      tap(response => {
        httpResponse.status(response.status);
        if (response.headers) {
          response.headers.forEach((value, name) => httpResponse.set(name, value));
        }
      }),
      map(response => response.body),
    );
  }
}
