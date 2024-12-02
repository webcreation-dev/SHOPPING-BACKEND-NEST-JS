import { HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string | object;
  error: string;
  meta?: object;
}

export class ErrorResponseUtil {
  static createErrorResponse(
    statusCode: HttpStatus,
    message: string | object,
    error: string,
    meta?: object,
  ): ErrorResponse {
    return {
      statusCode,
      message,
      error,
      meta,
    };
  }
}
