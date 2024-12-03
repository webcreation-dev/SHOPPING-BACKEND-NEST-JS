import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import AppDataSource from 'database/data-source';
import { Repository } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const [entityClass, property] = args.constraints;
    const repository: Repository<any> =
      AppDataSource.getRepository(entityClass);
    const count = await repository.count({ where: { [property]: value } });
    return count > 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [entityClass, property] = args.constraints;
    return `${property} does not exist in ${entityClass.name}`;
  }
}
