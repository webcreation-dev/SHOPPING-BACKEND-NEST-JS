import { registerDecorator, ValidationOptions } from 'class-validator';
import { ContractExistValidatorConstraint } from './generic-validation/contract-exist.validator';

export function IsContractExist(validationOptions?: ValidationOptions) {
  return function (constructor: new (...args: any[]) => any) {
    registerDecorator({
      name: 'isContractExist',
      target: constructor,
      propertyName: undefined,
      options: validationOptions,
      validator: ContractExistValidatorConstraint,
    });
  };
}
