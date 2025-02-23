import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { Public } from '../../auth';

export function HeaderOperation(
  summary: string,
  bodyType?: any,
  responseType?: any,
  isPublic: boolean = false,
) {
  const decorators = [ApiOperation({ summary })];

  if (bodyType) {
    decorators.push(ApiBody({ type: bodyType }));
  }

  if (responseType) {
    decorators.push(ApiOkResponse({ type: responseType }));
  }

  if (isPublic) {
    decorators.push(Public());
  }

  return applyDecorators(...decorators);
}
