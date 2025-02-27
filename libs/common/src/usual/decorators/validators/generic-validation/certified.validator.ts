import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import AppDataSource from '../../../../database/data-source';
import { Repository } from 'typeorm';
import { User } from 'src/features/auth/users/entities/user.entity';
import { StatusEnum } from 'src/features/auth/users/enums/status.enum';

@ValidatorConstraint({ async: true })
@Injectable()
export class CertifiedValidatorConstraint
  implements ValidatorConstraintInterface
{
  async validate(value: any, args: ValidationArguments) {
    const [property] = args.constraints;

    const repository: Repository<User> = AppDataSource.getRepository(User);

    const user = await repository.findOne({ where: { [property]: value } });

    if (user.status === StatusEnum.ACCEPTED) {
      return true;
    }
    return false;
  }

  defaultMessage() {
    return `Une des parties concernée n'as pas un encore un compte certifié Locapay`;
  }
}
