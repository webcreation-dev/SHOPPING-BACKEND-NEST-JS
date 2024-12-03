import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsExistConstraint } from './is-exist.validator';

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
      constraints: [entityClass, property],
      validator: IsExistConstraint,
    });
  };
}
