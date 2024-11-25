import {
  buildMessage,
  matches,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

const PASSWORD_REGEX = /.*[\d].*/;

const IS_PASSWORD_KEY = 'atLeastOneNumberLetter';

const atLeastOneNumberLetter = (value: string): boolean => {
  return matches(value, PASSWORD_REGEX);
};

export const AtLeastOneNumberLetter = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: IS_PASSWORD_KEY,
      validator: {
        validate: (value): boolean => atLeastOneNumberLetter(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain at least one Number letter',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
