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
import { In } from 'typeorm';

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
    const { tenant_id, landlord_id, property_id } = dto;

    // check if the landlord is the same as the tenant
    if (tenant_id === landlord_id) {
      this.errorMessage = `Le locataire et le gérant doivent être différents.`;
      return false;
    }

    // check if the contract already exists
    const exists = await contractRepository.exist({
      where: {
        tenant: { id: tenant_id },
        property: { id: property_id },
        status: In([StatusContractEnum.PENDING, StatusContractEnum.ACTIVE]),
      },
    });
    if (exists) {
      this.errorMessage = `Un contrat actif ou en attente existe déjà pour ce locataire et ce bien.`;
      return false;
    }

    // check if the property have article different of []
    const property = await propertyRepository.findOne({
      where: { id: property_id },
      relations: ['owner', 'user'], // Charge explicitement les relations
    });
    if (!property || property.articles.length === 0) {
      this.errorMessage = `Le bien doit avoir au moins un article pour cette propriété.`;
      return false;
    }

    // check if the property is managed by the landlord
    if (!property.user || property.user.id !== landlord_id) {
      this.errorMessage = `La location n'appartient pas au gérant.`;
      return false;
    }

    return true;
  }

  defaultMessage() {
    return this.errorMessage || `Erreur de validation du contrat.`;
  }
}
