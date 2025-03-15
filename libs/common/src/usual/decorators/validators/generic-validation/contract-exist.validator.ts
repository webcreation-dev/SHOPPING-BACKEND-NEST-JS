import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Contract } from 'src/features/contracts/entities/contract.entity';
import AppDataSource from '../../../../database/data-source';
import { StatusContractEnum } from 'src/features/contracts/enums/status-contract.enum';
import { Property } from 'src/features/properties/entities/property.entity';

@ValidatorConstraint({ async: true })
@Injectable()
export class ContractExistValidatorConstraint
  implements ValidatorConstraintInterface
{
  private errorMessage = '';

  async validate(_: any, args: ValidationArguments) {
    const dto: any = args.object;
    const contractRepository = AppDataSource.getRepository(Contract);
    const propertyRepository = AppDataSource.getRepository(Property);
    const { tenant_id, landlord_id, property_id, start_date, end_date } = dto;

    // check if the landlord is the same as the tenant
    if (tenant_id === landlord_id) {
      this.errorMessage = `Le locataire et le propriétaire doivent être différents.`;
      return false;
    }

    // check if the contract dates are valid
    if (new Date(start_date) >= new Date(end_date)) {
      this.errorMessage = `La date de début doit être antérieure à la date de fin.`;
      return false;
    }

    // check if the contract already exists
    const exists = await contractRepository.exist({
      where: {
        tenant: { id: tenant_id },
        property: { id: property_id },
        status: StatusContractEnum.ACTIVE || StatusContractEnum.PENDING,
      },
    });
    if (exists) {
      this.errorMessage = `Un contrat actif ou en attente existe déjà pour ce locataire et ce bien.`;
      return false;
    }

    // check if the property have article different of []
    const property = await propertyRepository.findOne({
      where: { id: property_id },
    });
    if (!property || property.articles.length === 0) {
      this.errorMessage = `Le bien doit avoir au moins un article pour cette propriété.`;
      return false;
    }

    // check if there is an active contract
    const activeContract = await contractRepository.exist({
      where: {
        property: { id: property_id },
        status: StatusContractEnum.ACTIVE || StatusContractEnum.PENDING,
      },
    });
    if (activeContract) {
      this.errorMessage = `Un contrat actif ou en attente existe déjà pour ce bien.`;
      return false;
    }
  }

  defaultMessage() {
    return this.errorMessage || `Erreur de validation du contrat.`;
  }
}
