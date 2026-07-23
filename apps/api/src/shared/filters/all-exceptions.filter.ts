import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@autohub/database';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '../types/api-response';
import { REQUEST_ID_HEADER } from '../constants/injection-tokens';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const mapped = this.mapException(exception);
    const { status, message, code, details } = mapped;

    const requestId =
      request.requestId ??
      (typeof request.headers[REQUEST_ID_HEADER] === 'string'
        ? request.headers[REQUEST_ID_HEADER]
        : crypto.randomUUID());

    if (status >= 500) {
      this.logger.error(
        `Unhandled error [${requestId}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.warn(
        `Prisma error [${requestId}] ${exception.code} ${request.method} ${request.url}`,
      );
    }

    const payload: ApiErrorResponse = {
      success: false,
      error: {
        statusCode: status,
        message,
        code,
        details,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(payload);
  }

  private mapException(exception: unknown): {
    status: number;
    message: string | string[];
    code?: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message: string | string[] = exception.message;
      let code: string | undefined;
      let details: unknown;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const body = exceptionResponse as Record<string, unknown>;
        if (body.message !== undefined) {
          message = body.message as string | string[];
        }
        if (typeof body.error === 'string') code = body.error;
        details = body.details;
      }

      return { status, message, code, details };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaKnownError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
      };
    }

    // Never echo raw Error.message for unexpected failures (leaks internals).
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }

  private mapPrismaKnownError(exception: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    code: string;
  } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          code: 'CONFLICT',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          code: 'NOT_FOUND',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid related resource',
          code: 'INVALID_REFERENCE',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          code: 'DATABASE_ERROR',
        };
    }
  }
}
