import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import AppDataSource from '../../../../database/data-source';
import { Property } from 'src/features/properties/entities/property.entity';
import { In } from 'typeorm';
import { Visit } from 'src/features/visits/entities/visit.entity';
import { StatusEnum } from 'src/features/visits/enums/status.enum';

@ValidatorConstraint({ async: true })
@Injectable()
export class VisitExistValidatorConstraint
  implements ValidatorConstraintInterface
{
  private errorMessage = '';

  async validate(_: any, args: ValidationArguments) {
    const dto: any = args.object;
    const propertyRepository = AppDataSource.getRepository(Property);
    const visitRepository = AppDataSource.getRepository(Visit);
    const { visitor_id, property_id } = dto;

    const property = await propertyRepository.findOne({
      where: { id: property_id },
      relations: ['user'],
    });

    // check if the landlord is the same as the tenant
    if (visitor_id === property.user.id) {
      this.errorMessage = `Le visiteur et le démarcheur doivent être différents.`;
      return false;
    }

    const exists = await visitRepository.exist({
      where: {
        user: { id: visitor_id },
        property: { id: property_id },
        status: In([StatusEnum.WAITING, StatusEnum.IN_PROGRESS]),
      },
    });
    if (exists) {
      this.errorMessage = `Une visite en cours ou en attente existe déjà pour ce visiteur et ce bien.`;
      return false;
    }

    return true;
  }

  defaultMessage() {
    return this.errorMessage || `Erreur de validation du contrat. n°2`;
  }
}
