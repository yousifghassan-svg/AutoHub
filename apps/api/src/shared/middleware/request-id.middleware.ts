import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from '../constants/injection-tokens';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { requestId?: string }, res: Response, next: NextFunction): void {
    const incoming =
      req.header(REQUEST_ID_HEADER) ??
      req.header(CORRELATION_ID_HEADER) ??
      crypto.randomUUID();

    const requestId = incoming.trim() || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    res.setHeader(CORRELATION_ID_HEADER, requestId);
    next();
  }
}
