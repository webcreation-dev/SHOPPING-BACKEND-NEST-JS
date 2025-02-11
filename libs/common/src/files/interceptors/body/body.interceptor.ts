import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      if (request.body.body) {
        const body = JSON.parse(request.body.body);
        request.body = body;
      }

      // Parse le champ `location` si présent
      if (request.body.location && typeof request.body.location === 'string') {
        request.body.location = JSON.parse(request.body.location);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    return next.handle();
  }
}
