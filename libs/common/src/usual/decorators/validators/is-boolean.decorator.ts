import { applyDecorators } from '@nestjs/common';
import { ToBoolean } from '../transformers/to-boolean.decorator';
import {
  IsBoolean as DefaultIsBoolean,
  ValidationOptions,
} from 'class-validator';

/**
 * Checks if the value is a boolean. Works with query params.
 */
export const IsBoolean = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  applyDecorators(DefaultIsBoolean(validationOptions), ToBoolean());
