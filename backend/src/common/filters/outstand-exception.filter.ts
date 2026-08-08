import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { OutstandApiError } from '../../outstand/outstand-api.error';

@Catch()
export class OutstandExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof OutstandApiError) {
      return res.status(exception.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: exception.message,
        details: exception.body,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
      return res.status(status).json({
        success: false,
        error: Array.isArray(message) ? message.join(', ') : message,
      });
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: message,
    });
  }
}
