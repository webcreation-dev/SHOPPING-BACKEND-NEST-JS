import { ValidationPipeOptions } from '@nestjs/common';

export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};

export const DEFAULT_PAGE_SIZE = {
  USER: 10,
  ORDER: 5,
  CATEGORY: 30,
} as const satisfies Record<string, number>;
