import { registerDecorator } from 'class-validator';
import { CertifiedValidatorConstraint } from './generic-validation/certified.validator';

export function IsCertified(property: string) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      validator: CertifiedValidatorConstraint,
    });
  };
}
