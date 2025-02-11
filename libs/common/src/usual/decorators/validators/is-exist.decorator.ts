import { registerDecorator, ValidationOptions } from 'class-validator';
import { GenericValidatorConstraint } from './generic-validation/generic.validator';

export function IsExist(
  entityClass: new () => any,
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property, 'exists'],
      validator: GenericValidatorConstraint,
    });
  };
}
