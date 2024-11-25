import { Length, ValidationOptions } from 'class-validator';
import { AtLeastOneLowercaseLetter } from './text-validation/at-least-one-lowercase-letter.decorator';
import { applyDecorators } from '@nestjs/common';
import { AtLeastOneNumberLetter } from './text-validation/at-least-one-number.decorator';
import { AtLeastOneUppercaseLetter } from './text-validation/at-least-one-uppercase-letter.decorator';
import { AtLeastOneSpecialCharacter } from './text-validation/at-least-one-special-character.decorator';
import { OnlyRequiredCharacters } from './text-validation/only-required-characters.decorator';

/**
 * Checks if the value is a string following these rules:
 * 1. 8 to 20 characters
 * 2. At least one
 * - Lowercase letter
 * - Uppercase letter
 * - Number
 * - Special character
 */
export const IsPassword = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  applyDecorators(
    AtLeastOneLowercaseLetter(validationOptions),
    AtLeastOneNumberLetter(validationOptions),
    AtLeastOneUppercaseLetter(validationOptions),
    AtLeastOneSpecialCharacter(validationOptions),
    OnlyRequiredCharacters(validationOptions),
    Length(8, 20, validationOptions),
  );
