import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE, APP_INTERCEPTOR, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { VALIDATION_PIPE_OPTIONS } from './util/common.constants';
import { JwtAuthGuard } from 'auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'auth/guards/roles/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { NotFoundExceptionFilter } from 'database/exception-filters/not-found-exception/not-found-exception.filter';
import { DatabaseExceptionFilter } from 'database/exception-filters/database-exception/database-exception.filter';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(VALIDATION_PIPE_OPTIONS),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DatabaseExceptionFilter,
    },
  ],
})
export class CommonModule {}
