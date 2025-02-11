import {
  buildMessage,
  matches,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

const PASSWORD_REGEX = /.*[a-z].*/;

const IS_PASSWORD_KEY = 'atLeastOneLowercaseLetter';

const atLeastOneLowercaseLetter = (value: string): boolean => {
  return matches(value, PASSWORD_REGEX);
};

export const AtLeastOneLowercaseLetter = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: IS_PASSWORD_KEY,
      validator: {
        validate: (value): boolean => atLeastOneLowercaseLetter(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain at least one lowercase letter',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
