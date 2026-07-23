import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { Request } from 'express';
import type { ApiSuccessResponse } from '../types/api-response';
import { REQUEST_ID_HEADER } from '../constants/injection-tokens';

/**
 * Wraps successful handler results in a standard envelope.
 * Health and other infra handlers still receive the same shape.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    const requestId =
      request.requestId ??
      (typeof request.headers[REQUEST_ID_HEADER] === 'string'
        ? request.headers[REQUEST_ID_HEADER]
        : crypto.randomUUID());

    return next.handle().pipe(
      map((data) => {
        const payload: ApiSuccessResponse<unknown> = {
          success: true,
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
        return payload;
      }),
    );
  }
}
