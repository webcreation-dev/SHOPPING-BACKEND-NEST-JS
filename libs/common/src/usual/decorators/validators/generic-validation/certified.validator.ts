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
  private errorMessage = '';

  async validate(value: any, args: ValidationArguments) {
    const [property] = args.constraints;

    const repository: Repository<User> = AppDataSource.getRepository(User);

    const user = await repository.findOne({ where: { [property]: value } });

    if (!user) {
      this.errorMessage = `Une des parties concernée n'as pas un encore un compte Locapay`;
      return false;
    }

    if (user.status != StatusEnum.ACCEPTED) {
      this.errorMessage = `Une des parties concernée n'as pas un encore un compte certifié Locapay`;
      return true;
    }
  }

  defaultMessage() {
    return this.errorMessage || `Erreur de validation du contrat.`;
  }
}
