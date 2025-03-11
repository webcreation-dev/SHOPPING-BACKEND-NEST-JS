import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseUtil } from 'libs/common/src/usual/util/error-response.util';

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    const formattedErrors = {};
    if (Array.isArray(exceptionResponse.message)) {
      exceptionResponse.message.forEach((error, index) => {
        const [property, ...constraints] = error.split(' ');
        if (!formattedErrors[property]) {
          formattedErrors[property] = {};
        }
        formattedErrors[property][index] = error;
      });
    }

    const errorResponse = ErrorResponseUtil.createErrorResponse(
      status,
      formattedErrors,
      exceptionResponse.error,
    );

    response.status(status).json(errorResponse);
  }
}
