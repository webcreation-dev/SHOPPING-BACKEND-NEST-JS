import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { Public } from '../../auth';

export function HeaderOperation(
  summary: string,
  bodyType?: any,
  isPublic: boolean = false,
) {
  const decorators = [ApiOperation({ summary }), ApiBody({ type: bodyType })];

  if (isPublic) {
    decorators.push(Public());
  }

  return applyDecorators(...decorators);
}
