import {
  buildMessage,
  matches,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

const PASSWORD_REGEX = /.*[@$!%*?&].*/;

const IS_PASSWORD_KEY = 'atLeastOneSpecialCharacter';

const atLeastOneSpecialCharacter = (value: string): boolean => {
  return matches(value, PASSWORD_REGEX);
};

export const AtLeastOneSpecialCharacter = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: IS_PASSWORD_KEY,
      validator: {
        validate: (value): boolean => atLeastOneSpecialCharacter(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain at least one lowercase letter',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
