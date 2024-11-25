import {
  buildMessage,
  matches,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

const PASSWORD_REGEX = /^[a-zA-Z\d@$!%*?&]+$/;

const IS_PASSWORD_KEY = 'onlyRequiredCharacters';

const onlyRequiredCharacters = (value: string): boolean => {
  return matches(value, PASSWORD_REGEX);
};

export const OnlyRequiredCharacters = (
  validationOptions?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: IS_PASSWORD_KEY,
      validator: {
        validate: (value): boolean => onlyRequiredCharacters(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must contain at least one lowercase letter',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
