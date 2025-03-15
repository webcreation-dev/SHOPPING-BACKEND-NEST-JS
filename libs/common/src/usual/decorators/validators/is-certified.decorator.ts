import { registerDecorator } from 'class-validator';
import { CertifiedValidatorConstraint } from './generic-validation/certified.validator';

export function IsCertified(
  entityClass: { new (...args: any[]): any },
  property: string,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [entityClass, property],
      validator: CertifiedValidatorConstraint,
    });
  };
}
