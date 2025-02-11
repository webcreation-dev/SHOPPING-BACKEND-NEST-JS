import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';
import { Response } from 'express';
import { HttpError } from '../../../usual/util/http-error.util';
import { extractFromText } from '../../../usual/regex/regex.util';
import { ErrorResponseUtil } from '../../../usual/util/error-response.util';

@Catch(EntityNotFoundError)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, error } = HttpError.NOT_FOUND;
    const { entityName } = this.extractMessageData(exception.message);
    const message = `${entityName} not found`;

    const errorResponse = ErrorResponseUtil.createErrorResponse(
      status,
      message,
      error,
    );

    response.status(status).json(errorResponse);
  }

  private extractMessageData(message: string) {
    const entityName = extractFromText(message, this.ENTITY_NAME_REGEX);
    return { entityName };
  }

  private readonly ENTITY_NAME_REGEX = /type\s\"(\w+)\"/;
}
