import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { MulterError } from 'multer';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
  timestamp: string;
}

/**
 * Centralised error handling. Every error leaves the API in the same JSON shape and internal
 * details (stack traces, SQL) are never exposed to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { status, message, details } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorBody = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message,
      ...(details && details.length ? { details } : {}),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(body);
  }

  private resolve(exception: unknown): { status: number; message: string; details?: string[] } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') return { status, message: res };
      const payload = res as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        return { status, message: 'Validation failed', details: payload.message };
      }
      return { status, message: payload.message ?? exception.message };
    }

    if (exception instanceof MulterError) {
      const message =
        exception.code === 'LIMIT_FILE_SIZE'
          ? 'File is too large'
          : exception.code === 'LIMIT_FILE_COUNT' || exception.code === 'LIMIT_UNEXPECTED_FILE'
            ? 'Too many files or unexpected file field'
            : 'File upload failed';
      return { status: HttpStatus.BAD_REQUEST, message };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const target = (exception.meta?.target as string[] | string | undefined) ?? 'value';
          const field = Array.isArray(target) ? target.join(', ') : target;
          return { status: HttpStatus.CONFLICT, message: `A record with this ${field} already exists` };
        }
        case 'P2025':
          return { status: HttpStatus.NOT_FOUND, message: 'Record not found' };
        case 'P2003':
          return { status: HttpStatus.BAD_REQUEST, message: 'Related record does not exist' };
        default:
          break;
      }
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' };
  }
}
