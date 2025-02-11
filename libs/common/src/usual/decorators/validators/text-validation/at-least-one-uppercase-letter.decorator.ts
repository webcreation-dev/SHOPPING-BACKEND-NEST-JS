import {
  buildMessage,
  matches,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

const PASSWORD_REGEX = /.*[A-Z].*/;

const IS_PASSWORD_KEY = 'atLeastOneUppercaseLetter';

const atLeastOneUppercaseLetter = (value: string): boolean => {
  return matches(value, PASSWORD_REGEX);
};

export const AtLeastOneUppercaseLetter = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: IS_PASSWORD_KEY,
      validator: {
        validate: (value): boolean => atLeastOneUppercaseLetter(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain at least one Uppercase letter',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
