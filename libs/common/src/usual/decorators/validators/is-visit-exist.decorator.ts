import { registerDecorator, ValidationOptions } from 'class-validator';
import { VisitExistValidatorConstraint } from './generic-validation/visit-exist.validator';

export function IsVisitExist(validationOptions?: ValidationOptions) {
  return function (constructor: new (...args: any[]) => any) {
    registerDecorator({
      name: 'isContractExist',
      target: constructor,
      propertyName: undefined,
      options: validationOptions,
      validator: VisitExistValidatorConstraint,
    });
  };
}
